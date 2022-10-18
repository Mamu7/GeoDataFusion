const express = require('express')
require('dotenv').config({ debug: true })
var base64 = require('base-64');
const fetch =  require("node-fetch");
const { promises: { readdir } } = require('fs')
var path = require("path");
var fs = require('fs')
var https = require('https')
const Swal = require('sweetalert2')
const axios = require('axios').default;
const rwClient = require("./twitterClient.js");
var convert = require('xml-js');
const sharp = require('sharp');
var gm = require('gm').subClass({imageMagick: true});
const StreamZip = require('node-stream-zip');
const MongoClient = require('mongodb').MongoClient
const NodeGeocoder = require('node-geocoder');

if (!fs.existsSync(__dirname + "/public/mapTiles")) {
  fs.mkdirSync(__dirname + "/public/mapTiles");
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const options = {           //Setzt Parameter für locationiq API
  provider: 'locationiq',
  apiKey: process.env.LOCATIONIQAPIKEY,
  formatter: null
};
const geocoder = NodeGeocoder(options);

var SHA256 = require("crypto-js/sha256");
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const copernicusUser = process.env.COPERNICUSUSERNAME;     // Username &
const copernicusPass = process.env.COPERNICUSPASSWORD;     // Passwort für copernicus API
const planetApiKey = process.env.PLANETAPIKEY;             // Api Key für Planet

app.use('/js', express.static(__dirname + '/public/js'))              //setzt Routen für Dateien
app.use('/css', express.static(__dirname + '/public/css'))
app.use("/mapTiles", express.static(__dirname + "/public/mapTiles"))

//Database Connection
const url = 'mongodb://localhost:27017/tweet'
const dbName = "DataFusion"
let db
MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)

  // Storing a reference to the database so you can use it later
  db = client.db(dbName)
  console.log(`Connected MongoDB: ${url}`)
  console.log(`Database: ${dbName}`)

})

//#########################################
//#######   APIS   ########################
//#########################################

//#########################################
//#######   Twitter   #####################
//#########################################

//Abfrage Tweets in AOI
app.get("/tweets/:lat/:long/:r", (req, res) => {
  var tweets = tweet(req.params.lat, req.params.long, req.params.r)
  .then(tweets => {
    res.send(tweets);
  })
  .catch(error => console.error(error))
})
//Abfrage Tweets in AOI
const tweet = async (lat, long, r) => {
  var url = "search/tweets.json?q=&geocode=" + lat + "," + long + "," + r + "km";
  const tweets = await rwClient.v1.get(url);
  return tweets;
}

//Abfrage Tweet by ID
app.get("/tweets/:id", (req, res) => {
  var tweets = tweetSingle(req.params.id)
  .then(tweets => {
    res.send(tweets);
  })
  .catch(error => res.send(false)/*console.error(error)*/)
})
//Abfrage Tweet by ID
const tweetSingle = async (id) => {
  var url = "statuses/show.json?id=" + id;
  const tweets = await rwClient.v1.get(url);
  return tweets;
}

//#########################################
//#######   Geocoding   ###################
//#########################################
app.get("/geocoding/:name", (req, res) => { //Abfrage LocationIQ API
  var name = getLocation(req.params.name)
  .then(name => {
    res.send(name);
  })
  .catch(error => console.error(error))
})

const getLocation = async (name) => {
  const res = await geocoder.geocode(name);
  return res;
}

//##############################################
//#######   mapTiles   #########################
//##############################################

app.get("/downloading/", (req, res) => {      //Server Endpoint --> Client kann Zustand des Downloads abfragen
  var downloading = [downloadingCopernicus, downloadingPlanet];
  res.send(downloading);
})

var currentMapTile = ""; //speichert aktuell beahandelten MapTile
//#########################################
//#######   copernicus   ##################
//#########################################
var downloadingCopernicus = [];

async function copernicusDownloadStatus(uuid, status) {     //aktualisiert den Download status
  for (var i = 0; i < downloadingCopernicus.length; i++) {
    if (downloadingCopernicus[i][0] === uuid) {
      downloadingCopernicus[i][1] = status;
    }
  }
}

async function finishCopernicusDownload(uuid) {     //schließt download ab : setzt Status auf downloaded, entfernt uuid aus Liste
  db.collection("mapTiles").insertOne({mapTileID: uuid, status: "downloaded"});
  var index = -1;
  for (var i = 0; i < downloadingCopernicus.length; i++) {
    if (downloadingCopernicus[i][0] === uuid) {
      index = i;
    }
  }
  if (index !== -1) {
    downloadingCopernicus.splice(index, 1);
  }
}

app.get("/copernicusSearch/:lat/:long/:dateA/:dateB/:maxCloudCover", (req, res) => {  //Abfrage Copernicus API
  var products = findProductsCopernicus(req.params.lat, req.params.long, req.params.dateA, req.params.dateB, req.params.maxCloudCover)
  .then(products => {
    res.send(products);
  })
  .catch(error => console.error(error))
})

const findProductsCopernicus = async (lat, long, dateA, dateB, maxCloudCover) => {    //Abfrage Copernicus API
  var start = 0;
  var rows = 100;
  var copernicusSearchURLRoot = "https://" + copernicusUser + ":" + copernicusPass + "@scihub.copernicus.eu/dhus/search?start=" + start + "&rows=" + rows + "&q=";
  var orderby = "beginposition asc";
  var footprint = "\"Intersects(" + lat + ", " + long + ")\"";
  var endposition = "[" + dateA + " TO " + dateB + "]";
  var cloudcoverpercentage = "[0 TO " + maxCloudCover + "]";
  var platformname = "Sentinel-2"
  try {
    var url = copernicusSearchURLRoot + "platformname:" + platformname + " AND footprint:" + footprint + " AND endposition:" + endposition + " AND cloudcoverpercentage:" + cloudcoverpercentage;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    const responseData = await response.text();
    var responseDataJSON = convert.xml2json(responseData, {compact: true, spaces: 4});
    return responseDataJSON;
    } catch (error) {
      console.error(error);
    }
}

app.get("/copernicusMaptiles/:uuid", (req, res) => {  //Abfrage Copernicus API MapTile Download
  var uuid = req.params.uuid;
  var temp = getCopernicusMapTiles(req.params.uuid)
  .then(temp => {
    res.send(temp);
  })
  .catch(error => console.error(error))
})

const getCopernicusMapTiles = async (uuid) => {   //Copernicus API MapTile Download
  var url = "https://" + copernicusUser + ":" + copernicusPass + "@scihub.copernicus.eu/dhus/odata/v1/Products(\'" + uuid + "\')/$value";
  downloadingCopernicus.push([uuid, "downloading"]);
  const file = fs.createWriteStream("./public/mapTiles/" + uuid + ".SAFE.zip");
  const request = await https.get(url, function(response) {
    response.pipe(file);
    file.on("finish", function() {
      file.close();
      moveFiles(uuid);
      return response;
    })
  }).on("error", function() {
    console.log("err");
    return("error");
  });
}

const getCopernicusMapTilesQuicklook = async (uuid) => {  //Abfrage Copernicus API MapTile Vorschau Download
  var urlQL = "https://" + copernicusUser + ":" + copernicusPass + "@scihub.copernicus.eu/dhus/odata/v1/Products(\'" + uuid + "\')/Products(\'Quicklook\')/$value";
  downloadingCopernicus.push([uuid, "downloading"]);
  const file = fs.createWriteStream("./public/mapTiles/" + uuid + ".png");
  const request = await https.get(urlQL, function(response) {
    response.pipe(file);
    file.on("finish", function() {
      file.close();
      finishCopernicusDownload(uuid);
      return response;
    })
  }).on("error", function() {
    console.log("err");
    return("error");
  });

}

const getDirectories = async source =>             //listet Ordner
(await readdir(source, { withFileTypes: true }))
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

function callbackTest() {} // Hilfsfunktion, da fs.unlink einen callback braucht

async function fileExists(uuid, isZip) {  //überprüft ob datei als ZIP oder so existiert
  var pathname = "";
  if (isZip == true) {
    pathname = __dirname + "/public/mapTiles/" + uuid + ".SAFE.zip";
  } else {
    pathname = __dirname + "/public/mapTiles/" + uuid;
  }
  var exists = false;
  try {
    if (fs.existsSync(pathname)) {
      exists = true;
    }
  } catch(err) {
    console.error(err)
  }
  return exists;
}

async function moveFiles(uuid) {    //entpackt ZIP, bewegt relevante Dateien, konvertiert von JP2 zu PNG
  copernicusDownloadStatus(uuid, "unzipping");
  var uuidZip = await fileExists(uuid, true);
  var uuidUnZip = await fileExists(uuid, false);
  if (uuidZip == true && uuidUnZip == false) {
    const zip = new StreamZip.async({ file: __dirname + "/public/mapTiles/" + uuid + ".SAFE.zip" });
    zip.on('error', function (err) { console.error('[ERROR]', err); });
    zip.on('ready', function () {
    });
    fs.mkdirSync("./public/mapTiles/" + uuid);
    const count = await zip.extract(null, './public/mapTiles/' + uuid);

    await zip.close();
    fs.unlink(__dirname + "/public/mapTiles/" + uuid + ".SAFE.zip", callbackTest);
  }
  copernicusDownloadStatus(uuid, "converting0");
  var directs = await getDirectories(__dirname + "/public/mapTiles/" + uuid);
  var directs2 = await getDirectories(__dirname + "/public/mapTiles/" + uuid + "/" + directs[0] + "/GRANULE/");
  var directs3 = __dirname + "\\public\\mapTiles\\" + uuid + "\\" + directs[0] + "\\GRANULE\\" + directs2[0] + "\\IMG_DATA";
  if (fs.existsSync(directs3 + "/R10m")) {
    directs3 = directs3 + "\\R10m";
  }
  var tileFiles = [];

  fs.readdirSync(directs3).forEach(file => {
    if (file.includes("B02") || file.includes("B03") || file.includes("B04")/* || file.includes("B08")*/) {
      tileFiles.push(file);
    }
  });

  var conversionsDone = 0;
  if (tileFiles.length > 0) {
    for (var i = 0; i < tileFiles.length; i++) {
      var channel = "";
      if (tileFiles[i].includes("B02")) {
        channel = "B02"
      } else if (tileFiles[i].includes("B03")) {
        channel = "B03";
      } else if (tileFiles[i].includes("B04")) {
        channel = "B04";
      } else if (tileFiles[i].includes("B08")) {
        channel = "B08";
      }
      var filenameJP2 = directs3 + "\\" + tileFiles[i];
      var filenamePNG = __dirname + "\\public\\mapTiles\\" + uuid + "\\" + uuid + "_" + channel + ".png";
      gm(filenameJP2).write(filenamePNG, function(err, value) {
        if(err) {
          console.log(err);
          console.log("Error: File Conversion Failed @ moveFiles()");
        }
        if (!err) {
          conversionsDone++;
          copernicusDownloadStatus(uuid, "converting" + conversionsDone)
          if (conversionsDone >= tileFiles.length) {
            combineFiles(uuid);
          }
        }
      });
    }
  } else {
    console.log("Error: Files do not exist @ moveFiles()");
  }
  return uuid;
}

async function combineFiles(uuid) {   //verbindet Kanäle zu Farbbild, erhöht Helligkeit, Normalisiert Pixeldaten
  copernicusDownloadStatus(uuid, "merging");
  var tileFiles = [];

  fs.readdirSync(__dirname + "/public/mapTiles/" + uuid).forEach(file => {
    if (file.includes(uuid + "_B02") || file.includes(uuid + "_B03") || file.includes(uuid + "_B04") || file.includes(uuid + "_B08")) {
      tileFiles.push(file);
    }
  });

  if (tileFiles.length >= 3) {
    var redChannel = __dirname + "/public/mapTiles/" + uuid + "/" + tileFiles[2];
    var greenChannel = __dirname + "/public/mapTiles/" + uuid + "/" + tileFiles[1];
    var blueChannel = __dirname + "/public/mapTiles/" + uuid + "/" + tileFiles[0];

    const redChannelGray = await sharp(redChannel).toColorspace("b-w").toBuffer();
    const greenChannelGray = await sharp(greenChannel).toColorspace("b-w").toBuffer();
    const blueChannelGray = await sharp(blueChannel).toColorspace("b-w").toBuffer();

    const test = await sharp(redChannelGray)
    .joinChannel([greenChannelGray, blueChannelGray])
    .trim(1)
    .modulate({
      brightness: 2,
      lightness: 75,
      saturation: 7.5
    })
    .normalize()
    .toFile(__dirname + "/public/mapTiles/" + uuid + ".png");

    finishCopernicusDownload(uuid);
  } else {
    console.log("Error: Files do not exist @ combineFiles()");
  }
}

//#########################################
//#######   Planet   ######################
//#########################################
var downloadingPlanet = [];

function finishPlanetDownload() { //schließt download ab : setzt Status auf downloaded, entfernt uuid aus Liste
  db.collection("mapTiles").findOneAndUpdate(
    {mapTileID: currentMapTile},
    {$set: {
      status: "downloaded"
      }
    },
    {
      upsert: false
    }
  )

  var index = -1;
  for (var i = 0; i < downloadingPlanet.length; i++) {
    if (downloadingPlanet[i][0] === currentMapTile) {
      index = i;
    }
  }
  if (index !== -1) {
    downloadingPlanet.splice(index, 1);
  }
}

app.get("/planetSearch/:lat/:long/:dateA/:dateB/:maxCloudCover", (req, res) => {    //Abfrage Planet API
  var products = findProductsPlanet(req.params.lat, req.params.long, req.params.dateA, req.params.dateB, req.params.maxCloudCover)
  .then(products => {
    res.send(products);
  })
  .catch(error => console.error(error))
})

const findProductsPlanet = async (lat, long, dateA, dateB, maxCloudCover) => {//Abfrage Planet API
  var sort = "acquired asc";
  var page_size = 250;
  var planetSearchURLRoot = "https://" + planetApiKey + ": @api.planet.com/data/v1/quick-search?_sort=" + sort + "&_page_size=" + page_size;
  var body = {
    "item_types": ["PSOrthoTile"],
    "filter":{
       "type":"AndFilter",
       "config":[
           {
            "type":"DateRangeFilter",
            "field_name":"acquired",
             "config":{
                "gte":dateA,
                "lte":dateB
             }
          },
          {
              "type":"GeometryFilter",
              "field_name":"geometry",
              "config":{
                  "type":"Point",
                  "coordinates": [parseFloat(long), parseFloat(lat)]
              }
          },
          {
            "type":"RangeFilter",
            "field_name":"cloud_cover",
            "config":{
                "lte":parseInt(maxCloudCover)
            }
          },
          {
             "type":"AssetFilter",
             "config": [
                "analytic_sr"
             ]
          }
       ]
      }
    };
    try {
    var url = planetSearchURLRoot;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
      });
      var responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json();
    } else {
      var errorM = { features: "error" };
      responseData = JSON.parse(error);
    }
    return responseData;
    } catch (error) {
      console.error(error);
    }
}


app.get("/planetMaptiles/:uuid", (req, res) => { //Abfrage Planet API nach ID zur Bestellung
  var uuid = req.params.uuid;
  var temp = orderPlanetMapTiles(req.params.uuid)
  .then(temp => {
    res.send(temp);
  })
  .catch(error => console.error(error))
})

const orderPlanetMapTiles = async (uuid) => { ////Abfrage Planet API nach ID zur Bestellung
  var url =  "https://" + planetApiKey + ": @api.planet.com/compute/ops/orders/v2";
  var order = "order:" + uuid;
  var body = {
    "name": order,
    "products": [
        {
            "item_ids":[
                uuid
            ],
            "item_type":"PSOrthoTile",
            "product_bundle":"visual"
        }
    ],
    "delivery":{

    }
  }
   try {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
    'Content-Type': 'application/json',
    "Authorization": "Basic " + base64.encode(planetApiKey + ":")
    },
    body: JSON.stringify(body)
    });
  const responseData = await response.text();
  db.collection("mapTiles").insertOne({mapTileID: uuid, status: "ordered"})
  return responseData;
  } catch (error) {
    console.error(error);
  }
}

app.get("/planetOrders/", (req, res) => { //Abfrage Planet API Bestellungen
  var orders = getPlanetOrders()
  .then(orders => {
    res.send(orders);
  })
  .catch(error => console.error(error))
})

const getPlanetOrders = async (uuid) => { //Abfrage Planet API Bestellungen
  var orders = [];
  var url = "https://api.planet.com/compute/ops/orders/v2";
   try {
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
    'Content-Type': 'application/json',
    "Authorization": "Basic " + base64.encode(planetApiKey + ":")
    }
    });
  const responseData = await response.json();
  for (var i = 0; i < responseData.orders.length; i++) {
    if (responseData.orders[i].name.includes("order:")) {
      orders.push([responseData.orders[i].name, responseData.orders[i].id])
    }
  }
  return orders;
  } catch (error) {
    console.error(error);
  }
}

app.get("/planetOrder/:id", (req, res) => { //Abfrage Planet API Bestellung nach ID zur Aktualisierung
  var order = getOnePlanetOrder(req.params.id)
  .then(order => {
    res.send(order);
  })
  .catch(error => console.error(error))
})

const getOnePlanetOrder = async (uuid) => {//Abfrage Planet API Bestellung nach ID zur Aktualisierung
  var orders = await getPlanetOrders(uuid);
  var id = "";
  for (var i = 0; i < orders.length; i++) {
    if (orders[i][0].includes(uuid) && id === "") {
      id = orders[i][1];
    }
  }
  if (id !== "") {
    var url = "https://api.planet.com/compute/ops/orders/v2/" + id;
     try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
      'Content-Type': 'application/json',
      "Authorization": "Basic " + base64.encode(planetApiKey + ":")
      }
      });
    const responseData = await response.text();
    var responseDataJSON;
    if (isJsonString(responseData)) {
      responseDataJSON = responseData;
    } else {
      responseDataObject = { message: responseData };
      responseDataJSON = JSON.stringify(responseDataObject);
    }
    return responseDataJSON;
    } catch (error) {
      console.error(error);
    }
  }
}

app.get("/planetDownload/:id", (req, res) => {    //Abfrage Download Planet
  var order = downloadPlanetOrders(req.params.id)
  .then(order => {
    res.send(order);
  })
  .catch(error => console.error(error))
})

const downloadPlanetOrders = async (uuid) => {    //Abfrage Download Planet
  var orderString = await getOnePlanetOrder(uuid);
  var order = JSON.parse(orderString);
  currentMapTile = uuid;
  var token = "error";
  for (var i = 0; i < order._links.results.length; i++) {
    if (order._links.results[i].name.includes("tif")) {
      token = order._links.results[i].location;
    }
  }
  var url = token;
  var filename = "./public/mapTiles/" + uuid;

  downloadingPlanet.push([uuid, "downloading"]);
  downloader(url, filename, convertFilesPlanet);
}

function downloader(url, filenameT, callback) { //Download Planet
    axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    })
        .then(function (response) {
            return new Promise((resolve, reject) => {
                const filename = filenameT;
                const file = fs.createWriteStream(`${filename}.tif`);
                response.data.pipe(file);

                file.on("error", (error) => {
                    return reject(`There was an error writing the file. Details: $ {error}`);
                });

                file.on('finish', () => {
                    file.close();
                });

                file.on('close', () => {
                    return resolve(filename);
                });
            });
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function (filename) {
            callback();
        })
}

function convertFilesPlanet() {   //konvertiert von TIFF nach PNG
  id = currentMapTile;
  for (var i = 0; i < downloadingPlanet.length; i++) {
    if (downloadingPlanet[i][0] === id) {
      downloadingPlanet[i][1] = "converting";
    }
  }
  fs.renameSync(__dirname + "/public/mapTiles/" + currentMapTile + ".tif", __dirname + "/public/mapTiles/" + currentMapTile + ".tiff");

    sharp(__dirname + "/public/mapTiles/" + id + ".tiff")
    .trim(1)
    .toFile(__dirname + "/public/mapTiles/" + id + ".png");
    finishPlanetDownload();
}
//#########################################
//#########################################
//#########################################
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

const PORT = 3000

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html')
})

//Server starten
https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app)
    .listen(PORT, function () {
        console.log('Example app listening on port 3000! Go to https://localhost:3000/')
    })

//#########################################
//#######   Datenbank   ###################
//#########################################

//#########################################
//#######   Tweets   ######################
//#########################################

app.get("/tweet/", (req, res) => {
  db.collection("tweet").find().toArray()
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.post("/tweet/", (req, res) => {
  db.collection("tweet").insertOne(req.body)
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.put("/tweet/", (req, res) => {
  db.collection("tweet").findOneAndUpdate(
    {tweetObject: req.body.tweetObject},
    {$set: {
      lat: req.body.lat,
      long: req.body.long,
      }
    },
    {
      upsert: true
    }
  )
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.delete("/tweet/", (req, res) => {
  db.collection("tweet").deleteOne(
    {tweetObject: req.body.tweetObject}
  )
  .then(results => {
    res.send("Deleted");
  })
  .catch(error => console.error(error))
})

//#########################################
//#######   Geocoding   ###################
//#########################################

app.get("/locations/", (req, res) => {
  db.collection("locations").find().toArray()
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.post("/locations/", (req, res) => {
  db.collection("locations").insertOne(req.body)
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

//#########################################
//#######   Map Tiles   ###################
//#########################################

app.get("/maptilesDB/", (req, res) => {
  db.collection("mapTiles").find().toArray()
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.post("/maptilesDB/", (req, res) => {
  db.collection("mapTiles").insertOne(req.body)
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.put("/maptilesDB/", (req, res) => {
  db.collection("mapTiles").findOneAndUpdate(
    {mapTileID: req.body.mapTileID},
    {$set: {
      status: req.body.status
      }
    },
    {
      upsert: false
    }
  )
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})

app.delete("/maptilesDB/", (req, res) => {
  db.collection("mapTiles").deleteOne(
    { mapTileID: req.body.mapTileID }
  )
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})
