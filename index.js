//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express')
//const base64 = require("base-64")
require('dotenv').config({ debug: true })
console.log(process.env)
var base64 = require('base-64');
const fetch =  require("node-fetch");
const { promises: { readdir } } = require('fs')
var path = require("path");
var fs = require('fs')
var https = require('https')
const axios = require('axios').default;
const rwClient = require("./twitterClient.js");
var convert = require('xml-js');
const sharp = require('sharp');
const StreamZip = require('node-stream-zip');
const MongoClient = require('mongodb').MongoClient

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'locationiq',

  // Optional depending on the providers
  //fetch: customFetchImplementation,
  apiKey: process.env.LOCATIONIQAPIKEY, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(options);

var SHA256 = require("crypto-js/sha256");



const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const copernicusUser = process.env.COPERNICUSUSERNAME;                    // Username &
const copernicusPass = process.env.COPERNICUSPASSWORD;     // Passwort für copernicus API
const planetApiKey = process.env.PLANETAPIKEY; // Api Key für Planet

app.use('/js', express.static(__dirname + '/public/js'))
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

//Tweets in AOI
app.get("/tweets/:lat/:long/:r", (req, res) => {
  //console.log(req.params);
  var tweets = tweet(req.params.lat, req.params.long, req.params.r)
  .then(tweets => {
    //console.log(tweets);
    res.send(tweets);
  })
  .catch(error => console.error(error))
})

const tweet = async (lat, long, r) => {
  var url = "search/tweets.json?q=&geocode=" + lat + "," + long + "," + r + "km";
  //console.log(url);
  const tweets = await rwClient.v1.get(url);
  return tweets;
  //console.log(tweets);
}
//tweet();

//Tweet by ID
app.get("/tweets/:id", (req, res) => {
  //console.log(req.params);
  var tweets = tweetSingle(req.params.id)
  .then(tweets => {
    //console.log(tweets);
    res.send(tweets);
  })
  .catch(error => console.error(error))
})

const tweetSingle = async (id) => {
  var url = "statuses/show.json?id=" + id;
  //console.log(url);
  const tweets = await rwClient.v1.get(url);
  //console.log(tweets);
  return tweets;
  //console.log(tweets);
}
//tweet();

//#########################################
//#######   Geocoding   ###################
//#########################################
app.get("/geocoding/:name", (req, res) => {
  //console.log(req.params);
  var name = getLocation(req.params.name)
  .then(name => {
    //console.log(name);
    res.send(name);
  })
  .catch(error => console.error(error))
})

const getLocation = async (name) => {
  const res = await geocoder.geocode(name);
  console.log(res);
  return res;
}
//getLocation("w");

//#########################################
//#######   mapTiles   ####################
//#########################################

//#########################################
//#######   copernicus   ##################
//#########################################

app.get("/copernicusSearch/:lat/:long/:dateA/:dateB/:maxCloudCover", (req, res) => {
  //console.log(req.params);
  var products = findProductsCopernicus(req.params.lat, req.params.long, req.params.dateA, req.params.dateB, req.params.maxCloudCover)
  .then(products => {
    res.send(products);
  })
  .catch(error => console.error(error))
})

const findProductsCopernicus = async (lat, long, dateA, dateB, maxCloudCover) => {
  var start = 0;
  var rows = 100;
  var copernicusSearchURLRoot = "https://" + copernicusUser + ":" + copernicusPass + "@scihub.copernicus.eu/dhus/search?start=" + start + "&rows=" + rows + "&q=";
  var orderby = "beginposition asc";
  var footprint = "\"Intersects(" + lat + ", " + long + ")\"";
  var endposition = "[" + dateA + " TO " + dateB + "]";
  var cloudcoverpercentage = "[0 TO " + maxCloudCover + "]";
  var platformname = "Sentinel-2"
  //console.log(footprint);
  try {
    var url = copernicusSearchURLRoot + "platformname:" + platformname + " AND footprint:" + footprint + " AND endposition:" + endposition + " AND cloudcoverpercentage:" + cloudcoverpercentage;
    //console.log(url);
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
//findProductsCopernicus(41.90, 12.50);

app.get("/copernicusMaptiles/:uuid", (req, res) => {
  //console.log(req.params);
  var uuid = req.params.uuid;
  var temp = getCopernicusMapTiles(req.params.uuid)
  .then(uuid => {
    //console.log(name);
    res.send(uuid);
  })
  .catch(error => console.error(error))
})

const getCopernicusMapTiles = async (uuid) => {
  var url = "https://" + copernicusUser + ":" + copernicusPass + "@scihub.copernicus.eu/dhus/odata/v1/Products(\'" + uuid + "\')/$value";
  //console.log(url);
  const file = fs.createWriteStream("./public/mapTiles/" + uuid + ".SAFE.zip");
  const request = await https.get(url, function(response) {
    response.pipe(file);
    file.on("finish", function() {
      console.log("f");
      file.close();
      moveFiles(uuid);
      return uuid;
    })
  }).on("error", function() {
    console.log("err");
    return("error");
  });

}
//getCopernicusMapTiles("7e2fc6db-037c-4219-a70c-4d5d9a6064bf");
//getCopernicusMapTiles("51367ce5-d022-4a23-91cc-e5d425385d79");
const getDirectories = async source =>
(await readdir(source, { withFileTypes: true }))
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

function callbackTest() {}

async function fileExists(uuid, isZip) {
  var pathname = "";
  if (isZip == true) {
    pathname = __dirname + "/public/mapTiles/" + uuid + ".SAFE.zip";
  } else {
    pathname = __dirname + "/public/mapTiles/" + uuid;
  }
  console.log(pathname);
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



async function moveFiles(uuid) {
  var uuidZip = await fileExists(uuid, true);
  var uuidUnZip = await fileExists(uuid, false);

  //console.log(uuidZip);
  //console.log(uuidUnZip);
  if (uuidZip == true && uuidUnZip == false) {
    const zip = new StreamZip.async({ file: __dirname + "/public/mapTiles/" + uuid + ".SAFE.zip" });

    zip.on('error', function (err) { console.error('[ERROR]', err); });
    zip.on('ready', function () {
      console.log('All entries read: ' + zip.entriesCount);
      //console.log(zip.entries());
    });
    fs.mkdirSync("./public/mapTiles/" + uuid);
    const count = await zip.extract(null, './public/mapTiles/' + uuid);
    console.log(`Extracted ${count} entries`);
    await zip.close();
    fs.unlink(__dirname + "/public/mapTiles/" + uuid + ".SAFE.zip", callbackTest);
  }

  var directs = await getDirectories(__dirname + "/public/mapTiles/" + uuid);
  var directs2 = await getDirectories(__dirname + "/public/mapTiles/" + uuid + "/" + directs[0] + "/GRANULE/");
  var directs3 = __dirname + "/public/mapTiles/" + uuid + "/" + directs[0] + "/GRANULE/" + directs2[0] + "/IMG_DATA/R10m";
  var tileFiles = [];

  fs.readdirSync(directs3).forEach(file => {
    if (file.includes("B02") || file.includes("B03") || file.includes("B04") || file.includes("B08")) {
      tileFiles.push(file);
    }
  });
  if (tileFiles.length > 0) {
    for (var i = 0; i < tileFiles.length; i++) {
      fs.rename(directs3 + "/" + tileFiles[i], __dirname + "/public/mapTiles/" + uuid + "/" + tileFiles[i], callbackTest);
    }
  } else {
    console.log("error");
  }
  //console.log(tileFiles);
  return uuid;
}
//moveFiles("51367ce5-d022-4a23-91cc-e5d425385d79");

async function convertFiles(uuid) {
  var tileFiles = [];

  fs.readdirSync(__dirname + "/public/mapTiles").forEach(file => {
    if (file.includes(uuid + "_B02") || file.includes(uuid + "_B03") || file.includes(uuid + "_B04") || file.includes(uuid + "_B08")) {
      tileFiles.push(file);
    }
  });
  console.log(tileFiles);
  var redChannel = __dirname + "/public/mapTiles/" + tileFiles[2];
  var greenChannel = __dirname + "/public/mapTiles/" + tileFiles[1];
  var blueChannel = __dirname + "/public/mapTiles/" + tileFiles[0];
  console.log(redChannel);
  const test = await sharp(__dirname + "/public/mapTiles/test.jp2")//.joinChannel([greenChannel, blueChannel])
  .png()
  .toFile("test.png");
}
//convertFiles("51367ce5-d022-4a23-91cc-e5d425385d79");
//#########################################
//#######   Planet   ######################
//#########################################

app.get("/planetSearch/:lat/:long/:dateA/:dateB/:maxCloudCover", (req, res) => {
  //console.log(req.params);
  var products = findProductsPlanet(req.params.lat, req.params.long, req.params.dateA, req.params.dateB, req.params.maxCloudCover)
  .then(products => {
    res.send(products);
  })
  .catch(error => console.error(error))
})

const findProductsPlanet = async (lat, long, dateA, dateB, maxCloudCover) => {
  var sort = "acquired asc";
  var page_size = 250;
  //https://api.planet.com/data/v1/quick-search?_sort=acquired asc&_page_size=50
  var planetSearchURLRoot = "https://" + planetApiKey + ": @api.planet.com/data/v1/quick-search?_sort=" + sort + "&_page_size=" + page_size;
  //console.log(planetSearchURLRoot);
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
    //console.log(url);
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
      });
    const responseData = await response.json();
    //console.log(responseData);
    return responseData;
    } catch (error) {
      console.error(error);
    }
}
//findProductsPlanet(41.90, 12.50);


app.get("/planetMaptiles/:uuid", (req, res) => {
  //console.log(req.params);
  var uuid = req.params.uuid;
  var temp = orderPlanetMapTiles(req.params.uuid)
  .then(uuid => {
    //console.log(name);
    res.send(uuid);
  })
  .catch(error => console.error(error))
})

const orderPlanetMapTiles = async (uuid) => {
  var url =  "https://" + planetApiKey + ": @api.planet.com/compute/ops/orders/v2";
  var body = {
    "name": "order:5689895_3761710_2022-06-06_2416",
    "products": [
        {
            "item_ids":[
                "5689895_3761710_2022-06-06_2416"
            ],
            "item_type":"PSOrthoTile",
            "product_bundle":"visual"
        }
    ],
    "delivery":{

    }
}
   try {
  //console.log(url);
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
  console.log(responseData);
  return responseData;
  } catch (error) {
    console.error(error);
  }
}
//orderPlanetMapTiles("5692447_3761710_2022-06-07_227a");

const getPlanetOrders = async (uuid) => {
  var orders = [];
  var url = "https://api.planet.com/compute/ops/orders/v2";
   try {
  //console.log(url);
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
  //console.log(responseData);
  return orders;
  } catch (error) {
    console.error(error);
  }
}
//getPlanetOrders();

const getOnePlanetOrder = async (uuid) => {
  var orders = await getPlanetOrders(uuid);
  //console.log(orders);
  var id = "";
  for (var i = 0; i < orders.length; i++) {
    if (orders[i][0].includes(uuid)) {
      id = orders[i][1];
    }
  }
  console.log(id);
  var url = "https://api.planet.com/compute/ops/orders/v2/" + id;
   try {
  //console.log(url);
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
    'Content-Type': 'application/json',
    "Authorization": "Basic " + base64.encode(planetApiKey + ":")
    }
    });
  const responseData = await response.json();
  console.log(responseData);
  return responseData;
  } catch (error) {
    console.error(error);
  }
}

const downloadPlanetOrders = async (uuid) => {
  var order = await getOnePlanetOrder(uuid);
  console.log(order);
  var token = "";
  for (var i = 0; i < order._links.results.length; i++) {
    if (order._links.results[i].name.includes("tif")) {
      token = order._links.results[i].location;
    }
  }
  var url = token;
  console.log(url);
  var filename = "./public/mapTiles/" + uuid /**+ ".tif"*/;
  //const file = fs.createWriteStream("./public/mapTiles/" + uuid + ".tif");
  //const request = https.get(url, function(response) {
    //console.log(response.socket._httpMessage);
    //console.log(response._httpMessage);
  //})
  downloader(url, filename, callbackTest);
  /**
  const file = fs.createWriteStream("./public/mapTiles/" + uuid + ".tif");
  const request = https.get(url, function(response) {
   response.pipe(file);
   console.log(response);
   // after download completed close filestream
   file.on("finish", () => {
       file.close();
       console.log("Download Completed");
   });
});*/

}

//downloadPlanetOrders("5689895_3761710_2022-06-06_2416");

function downloader(url, filenameT, callback) {
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
            callback(filename);
        })
}

function convertFilesPlanet(id) {
  //fs.rename(__dirname + "/public/mapTiles/" + id + ".tif", __dirname + "/public/mapTiles/" + id + ".tiff", callbackTest)
  sharp(__dirname + "/public/mapTiles/" + id + ".tiff")
  .toFile(__dirname + "/public/mapTiles/" + id + ".png");
}
//convertFilesPlanet("5689895_3761710_2022-06-06_2416");
//#########################################
//#########################################
//#########################################

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;


const PORT = 3000

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html')
})


https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app)
    .listen(3000, function () {
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
  //console.log(req.body);
  db.collection("tweet").insertOne(req.body)
  .then(results => {
    res.send(results);
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
  //console.log(req.body);
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
  console.log(req.body);
  db.collection("mapTiles").insertOne(req.body)
  .then(results => {
    res.send(results);
  })
  .catch(error => console.error(error))
})
