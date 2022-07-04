//####################################################################################################################################
//#######   VAR   ####################################################################################################################
//####################################################################################################################################


const urlDBTweet = "https://localhost:3000/tweet/";                                   //URL Datenbankverbindung Tweets
const urlDBLocations = "https://localhost:3000/locations/";                           //URL Datenbankverbindung Locations
const urlDBMapTiles = "https://localhost:3000/mapTilesDB/"                            //URL Datenbankverbindung mapTiles
const urlAPITweet = "https://localhost:3000/tweets/";                                 //URL API Anbindung Tweets
const urlAPILocation = "https://localhost:3000/geocoding/";                           //URL API Anbindung Locations
//const urlTwitter = "https://api.twitter.com/1.1/search/tweets.json?q=&geocode=";      //URL API Anbindung Twitter
const urlAPICopernicusSearch = "https://localhost:3000/copernicusSearch/";            //URL API Anbindung copernicus Suche
const urlAPICopernicusMapTiles = "https://localhost:3000/copernicusMapTiles/";        //URL API Anbindung copernicus mapTiles
const urlAPIPlanetSearch = "https://localhost:3000/planetSearch/";                    //URL API Anbindung Planet Suche
const urlAPIPlanetMapTiles = "https://localhost:3000/planetMaptiles/";                //URL API Anbindung Planet mapTiles

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {    //Distanz zwischen zwei Punkten errechnen
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}
function deg2rad(deg) {
  return deg * (Math.PI/180)
}//-----------------------------------------------------------------------------------------------------

//----------------------------------Map-----------------------------------------------------------------
var centerLat = -1000;
var centerLong = -1000;
var radius = 50;
var text1 = document.getElementById("text1");
var button1 = document.getElementById("button1");
var radiusInput = document.getElementById("input1");
var circle = new L.circle();

var map = L.map('map').setView([49.5, 32.0], 6);
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

//var imageUrl = "https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg";
//var imageUrl = "file:///C:/Uni/App/public/mapTiles/51367ce5-d022-4a23-91cc-e5d425385d79/T37UDQ_20220610T083611_B02_10m.jp2";
var imageUrl = "https://localhost:3000/mapTiles/5689895_3761710_2022-06-06_2416.png";
var errorOverlayUrl = 'https://cdn-icons-png.flaticon.com/512/110/110686.png';
var altText = 'Image of Newark, N.J. in 1922. Source: The University of Texas at Austin, UT Libraries Map Collection.';
var latLngBounds = L.latLngBounds([[40.799311, -74.118464], [40.68202047785919, -74.33]]);
var imageOverlay = L.imageOverlay(imageUrl, latLngBounds, {
    opacity: 1,
    errorOverlayUrl: errorOverlayUrl,
    alt: altText,
    interactive: true
})/*.addTo(map)*/;
/*
var baseMaps = {
    "OpenStreetMap": osm
};

var overlayMaps = {
  "tile": tile
}

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);*/

button1.addEventListener("click", setUserRadius, false);
map.on('click', onMapClick);

var circleSiwersk = new L.circle([48.866295694987045, 38.09141727142872], {radius: 5000, color: "red"});
map.addLayer(circleSiwersk);
var polygonOnMap;
var imageOverlayed = false;

//----------------------------------Twitter-------------------------------------------------------------
var tweetsObj;
var tweetsDBObj;
var tweets = [];
var tweetsDB = [];
var tweetsList = [];
var prevButton = document.getElementById("prev");
var nextButton = document.getElementById("next");
var button2 = document.getElementById("button2");
var buttonSat = document.getElementById("buttonSat");
var buttonLink = document.getElementById("buttonLink");
var buttonDownload = document.getElementById("buttonDownload");
var buttonTime = document.getElementById("buttonTime");
var buttonClouds = document.getElementById("buttonClouds");
var timespanInput = document.getElementById("input2");
var maxCloudCoverInput = document.getElementById("input3");
var text2 = document.getElementById("text2");
var text3 = document.getElementById("text3");
var text4 = document.getElementById("text4");
var mapTileInfo = document.getElementById("mapTileInfo");
var prevTilesButton = document.getElementById("prevTiles");
var nextTilesButton = document.getElementById("nextTiles");
var tiles0 = document.getElementById("tiles0");
var tiles1 = document.getElementById("tiles1");
var tiles2 = document.getElementById("tiles2");
var tiles3 = document.getElementById("tiles3");
var tiles4 = document.getElementById("tiles4");
var tiles5 = document.getElementById("tiles5");
var tiles6 = document.getElementById("tiles6");
var tiles7 = document.getElementById("tiles7");
var tiles8 = document.getElementById("tiles8");
var tiles9 = document.getElementById("tiles9");
var tilesList = [tiles0, tiles1, tiles2, tiles3, tiles4, tiles5, tiles6, tiles7, tiles8, tiles9];
button2.addEventListener("click", getTweets, false);
prevButton.addEventListener("click", previous, false);
nextButton.addEventListener("click", next, false);
buttonLink.addEventListener("click", openLink, false);
buttonDownload.addEventListener("click", downloadMapTile, false);
buttonSat.addEventListener("click", getSatelliteImages, false);
buttonTime.addEventListener("click", setTimespan, false);
buttonClouds.addEventListener("click", setmaxCloudCover, false);
tweetButton0.addEventListener("click", pickTweet, false);
tweetButton1.addEventListener("click", pickTweet, false);
tweetButton2.addEventListener("click", pickTweet, false);
tweetButton3.addEventListener("click", pickTweet, false);
tweetButton4.addEventListener("click", pickTweet, false);
tweetButton5.addEventListener("click", pickTweet, false);
tweetButton6.addEventListener("click", pickTweet, false);
tweetButton7.addEventListener("click", pickTweet, false);
tweetButton8.addEventListener("click", pickTweet, false);
tweetButton9.addEventListener("click", pickTweet, false);
prevTilesButton.addEventListener("click", prevTiles, false);
nextTilesButton.addEventListener("click", nextTiles, false);
for (var i = 0; i < tilesList.length; i++) {
  tilesList[i].addEventListener("click", pickTile, false);
}
var p0 = document.getElementById("p0");
var p1 = document.getElementById("p1");
var p2 = document.getElementById("p2");
var p3 = document.getElementById("p3");
var p4 = document.getElementById("p4");
var p5 = document.getElementById("p5");
var p6 = document.getElementById("p6");
var p7 = document.getElementById("p7");
var p8 = document.getElementById("p8");
var p9 = document.getElementById("p9");
var tweetparas = [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9];
var coordinatesOfLocationLat = -1000;
var coordinatesOfLocationLong = -1000;
var marker0 = new L.marker();
var marker1 = new L.marker();
var marker2 = new L.marker();
var marker3 = new L.marker();
var marker4 = new L.marker();
var marker5 = new L.marker();
var marker6 = new L.marker();
var marker7 = new L.marker();
var marker8 = new L.marker();
var marker9 = new L.marker();
var markerList = [marker0, marker1, marker2, marker3, marker4, marker5, marker6, marker7, marker8, marker9];
var page = 1;
var maxPage = Math.ceil(tweetsList.length / 10);
var pageCounter = document.getElementById("pageCounter");
var currentTweetPicked = -1;
var p10 = document.getElementById("p10");
var tweetLink = "";
var timespan = 5;
var maxCloudCover = 50;
var dbIDs = [];
var copernicusIDs = [];
var planetIDs = [];
var mapTilesIDs = [];
var pageTiles = 1;
var maxPageTiles = Math.ceil(copernicusIDs.length / 10);
var pageCounterTiles = document.getElementById("pageCounterTiles");
var currentTilePicked = -1;
var polygonDrawn = false;
var pickedTile = "";
var downloading = false;
var status = "error";


function latLongSwitch(coordinates) {
  var newCoordinates;
  coordinates
  if (Array.isArray(coordinates[0])) {
    newCoordinates = [];
    for (var i = 0; i < coordinates.length; i++) {
      var l1 = coordinates[i][0];
      var l2 = coordinates[i][1];
      newCoordinates.push([l2, l1]);
    }
  } else {
    var l1 = coordinates[0];
    var l2 = coordinates[1];
    newCoordinates = [l2, l1];
  }
  return newCoordinates;
}
//-------------------------------------------Geocoding--------------------------------------------------------
var locations = [];                                                             //Liste der Locations der Twitter user (Name + Koordinaten) aus DB

//####################################################################################################################################
//#######   Map   ####################################################################################################################
//####################################################################################################################################

/* UI Update */
function updateText() {                                                         //Setzt Text:
  if (centerLat == -1000 || centerLong == -1000) {                              //wenn keine Area of Interest gesetz wurde:
     text1.innerHTML = "Klicken um Area of Interest mit Radius von " + radius + " km zu setzen!" // Hinweis zur Nutzung
  } else {                                                                      //wenn eine AOI gesetz wurde:
    button2.disabled = false;                                                   //aktiviert Button zur Tweetsuche
    text1.innerHTML = "Area of Interest ist " + radius + " km um Koordinate  " + centerLat + " / " + centerLong + " (Lat/Long)!"; //beschreibt AOI
  }
}

/* setzt AOI an angeklickte Stelle mit aktuellem radius */
function onMapClick(e) {
  centerLat = e.latlng.lat;
  centerLong = e.latlng.lng;
  map.removeLayer(circle);
  circle = new L.circle(e.latlng, {radius : radius * 1000});                    //erstellt Kreis zur Visualisierung
  map.addLayer(circle);
  updateText();
}

/* setzt Radius auf vom Nutzer eingegebenen Wert */
function setUserRadius() {
  if (radiusInput.value >= 1 && radiusInput.value < 501) {                      //sofern dieser min 1 und max 500
    radius = Math.floor(radiusInput.value);                                     //rundet ab
    circle.setRadius(radius * 1000);                                            //rechnet in Meter um
    updateText();
  } else {
    alert("Radius muss zwischen 1 und 500 liegen!")                             //sonst error
    //console.log(tweets);
  }

}

//####################################################################################################################################
//########   Twitter   ###############################################################################################################
//####################################################################################################################################

/* vorherige Seite der Tweetliste */
function previous() {
  page--;
  updatePageCounter();
  showTweets();
}
/* nächste Seite der Tweetliste */
function next() {
  page++;
  updatePageCounter();
  showTweets();
}
/* setzt Seitenzähler für Tweets */
function updatePageCounter() {
  pageCounter.innerHTML = page + " / " + maxPage;
  if (page <= 1) {                                  //wenn auf Seite 1
    prevButton.disabled = true;                     //Button für vorherige Seite deaktivieren
  } else {                                          //sonst
    prevButton.disabled = false;                    //Button für vorherige Seite aktivieren
  }
  if (page >= maxPage) {                            //wenn auf letzter Seite
    nextButton.disabled = true;                     //Button für nächste Seite deaktivieren
  } else {                                          //sonst
    nextButton.disabled = false;                    //Button für nächste Seite aktivieren
  }
}

/* Sammelt Tweets aus DB und über die Twitter API und speichert diese in einer Liste */
async function getTweets() {
  tweetsDB = [];            //
  tweets = [];              //Listen leeren
  tweetsList = [];          //
  tweetsDBObj = await getTweetsDB();                                            //alle Tweets aus DB
  tweetsObj = await getTweetsAPI();                                             //Tweets der API in AOI
  //console.log(tweetsDBObj);
  //console.log(tweetsObj.statuses[0]);
  for (var i = 0; i < tweetsDBObj.length; i++) {                                //Tweets aus DB in Liste speichern, wenn diesenin AOI sind
    if (getDistanceFromLatLonInKm(centerLat, centerLong, tweetsDBObj[i].lat, tweetsDBObj[i].long) < radius) {
      tweetsDB.push(tweetsDBObj[i].tweetObject);
    }
  }
  for (var i = 0; i < tweetsObj.statuses.length; i++) {
    var inDBList = false;
    for (var j = 0; j < tweetsDB.length; j++) {
      if (tweetsObj.statuses[i].id == tweetsDB[j].id) {                         //überprüfen, ob Tweet aus API in Liste der Datenbank
        inDBList = true;
      }
    }
    if (inDBList == false) {                                                    //wenn Tweets nicht in Liste:
      if (tweetsObj.statuses[i].geo != undefined) {                             //wenn Geodaten vorhanden:
        console.log("add");                                                     //hinzufügen
        addTweetsDB(tweetsObj.statuses[i], tweetsObj.statuses[i].geo.coordinates[0], tweetsObj.statuses[i].geo.coordinates[1]);
      } else {                                                                  //wenn keine Geodaten vorhanden:
        var locationObj = await getCoordinatesOfLocation(tweetsObj.statuses[i]);//Koordinaten über locationiq API erhalten
        //console.log(locationObj);
        if (locationObj != [] && locationObj[0] != undefined) {
          if (locationObj[0] != undefined && locationObj[0] != undefined) {
            var coordinates = [locationObj[0], locationObj[1]];
            var geo = { coordinates };
            tweetsObj.statuses[i].geo = geo;
          } else {
            console.log("no coordinates found");
          }
        }else {
          console.log("no location found");
        }
      }
      if (tweetsObj.statuses[i].user.location != "YAMA" && tweetsObj.statuses[i].user.location != "PRISTIN" && tweetsObj.statuses[i].user.location != "Surabaya, INDONESIA") {  //Tweets aus Japan und Thailand rausfiltern
        tweets.push(tweetsObj.statuses[i]);
      }
    }
  }
  //console.log(tweetsDB);
  //console.log(tweets);
  tweetsList = tweetsDB.concat(tweets);                                         //beide Listen zusammenfügen
  //console.log(tweetsList);
  maxPage = Math.ceil(tweetsList.length / 10);                                  //Anzahl an Seiten für Tweets setzten
  updatePageCounter();                                                          //UI updaten
  showTweets();                                                                 //Tweets anzeigen
}

// GET TWEETS API --------------------------------------------------------------------------------------
/* getTweetsAPIH + getTweetsAPI:
Anfrage an Twitter API für Tweets in AOI (7 Tage zurück) */
async function getTweetsAPIH() {
  try {
    var url = urlAPITweet + centerLat + "/" + centerLong + "/" + radius
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    const responseData = await response.json();
    return responseData;
    } catch (error) {
      console.error(error);
    }
}
async function getTweetsAPI() {
  var tweetsTemp = await getTweetsAPIH();
  //showTweets();
  //console.log(tweetsTemp);
  return tweetsTemp;
}
//-------------------------------------------------------------------------------------------------------
//GET SINGLE TWEET API
/* getSingleTweetH + getSingleTweet:
Anfrage an Twitter API für einen Tweet mit bestimmter ID */
async function getSingleTweetH(id) {
  try {
    var url = urlAPITweet + id
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    const responseData = await response.json();
    return responseData;
    } catch (error) {
      console.error(error);
    }
}
async function getSingleTweet(id) {
  var tweet = await getSingleTweetH(id);
  //showTweets();
  addTweetsDB(tweet, tweet.geo.coordinates[0], tweet.geo.coordinates[1]);
  //console.log(tweet);
}
//getSingleTweet("1533713231830822914");
//getSingleTweet("1532646733842460700");
//getSingleTweet("1535026489972117500");
//getSingleTweet("1535976604509212700");
//getSingleTweet("1532646733842460674");
//getSingleTweet("1535026489972117504");
//getSingleTweet("1535976604509212672 ");
//-------------------------------------------------------------------------------------------------------
//GET TWEETS DB
/* getTweetsDBH + getTweetsDB:
Anfrage an DB für alle Tweets */
async function getTweetsDBH() {
  try {
      var url = urlDBTweet;
      const response = await fetch(url, {
          method: 'GET',
          credentials: 'same-origin'
        });
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(error);
    }
}
async function getTweetsDB() {
  var tweetsDBTemp = await getTweetsDBH();
  //showTweets();
  //console.log(tweetsDB);
  return tweetsDBTemp;
}
getTweetsDB();
//-------------------------------------------------------------------------------------------------------
// ADD SINGLE TWEET DB
/* getSingleTweetDBH + getSingleTweetDB:
Anfrage an DB für Tweets, überprüft ob übergebene ID in DB ist, gibt boolean zurück
TEST */
async function getSingleTweetDBH() {
  try {
      var url = urlDBTweet;
      const response = await fetch(url, {
          method: 'GET',
          credentials: 'same-origin'
        });
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(error);
    }
}
async function getSingleTweetDB(id) {
  tweetsDB = await getSingleTweetDBH();
  var idFound = false;
  for (var i = 0; i < tweetsDB.length; i++) {
    if (tweetsDB[i].tweetObject.id == id) {
      idFound = true;
    }
  }
  //showTweets();
  //console.log(tweetsDB);
  return idFound;
}
//-------------------------------------------------------------------------------------------------------
// ADD TWEETS DB
/* addTweetsDBH + addTweetsDB:
Fügt DB Tweet hinzu */
async function addTweetsDBH(tweet, lat, long) {
  try {
    var data = { tweetObject: tweet, lat: lat, long: long };
    var dataJSON = JSON.stringify(data);
    var url = urlDBTweet;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        "Content-Type": "application/json"
      },
      body: dataJSON
      });
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(error);
    }
}
async function addTweetsDB(tweet, lat, long) {
  var test = await addTweetsDBH(tweet, lat, long);
  //showTweets();
  //console.log(test);
}
//-------------------------------------------------------------------------------------------------------
//Tweets anzeigen
/* Zeigt 10 Tweets auf Seite an
Zeigt Text, Erstellungszeitpunkt, Koordinate, locationName */
function showTweets() {
  for (var i = 0; i < tweetparas.length; i++) {
    var pos = i + ((page - 1) * 10);
    if (tweetsList[pos] != undefined) {
      var geo = "N/A"
      if (tweetsList[pos].geo != undefined && tweetsList[pos].geo.coordinates[0] != -3000 && tweetsList[pos].geo.coordinates[1] != -3000) {
        geo = tweetsList[pos].geo.coordinates;
      }
      var text = tweetsList[pos].text + " <br> Erstellungszeitpunkt: " + tweetsList[pos].created_at + " <br> geo: " + geo + " <br> location: " + tweetsList[pos].user.location;
      tweetparas[i].innerHTML = text;
    } else {
      console.log("kein " + pos + ". Tweet gefunden");
    }
  }
  unPickTweet();
  showTweetsOnMap();
}

/* Zeigt Tweets auf Map an
Setzt Marker für 10 Tweets */
async function showTweetsOnMap() {
  for (var i = 0; i < markerList.length; i++) {
    var pos = i + ((page - 1) * 10);
    map.removeLayer(markerList[i]);
    if (tweetsList[pos] != undefined) {
      //console.log(tweetsList[pos].geo.coordinates);
      if (tweetsList[pos].geo == undefined || tweetsList[pos].geo.coordinates[0] == -3000 || tweetsList[pos].geo.coordinates[1] == -3000) {
        //alert("keine Geodaten verfügbar");
        //getCoordinatesOfLocation();
      } else {
        markerList[i].setLatLng(tweetsList[pos].geo.coordinates);
        markerList[i].bindPopup(tweetsList[pos].text + " <br> Erstellungszeitpunkt: " + tweetsList[pos].created_at + " <br> geo: " + tweetsList[pos].geo.coordinates + " <br> location: " + tweetsList[pos].user.location).openPopup();
        map.addLayer(markerList[i]);
      }
    } else {

    }
  }
}
//####################################################################################################################################
//########   Geocoding   #############################################################################################################
//####################################################################################################################################

/* Sucht Koordinaten für Tweet, der nur einen Namen als Location hat
Anfrage an DB, wenn kein Ergebnis gefunden an locationiq API
wenn Ergebnis über API gefunden: fügt dieses der DB hinzu
gibt Koordinaten zurück */
async function getCoordinatesOfLocation(tweet) {
  var coordinatesTemp = [-1000, -1000];
  var locationAPI = [-2000, -2000];
  locations = await getLocationsDB();
  for (var i = 0; i < locations.length; i++) {
    if (locations[i].locationName == tweet.user.location) {
      coordinatesTemp = [locations[i].lat, locations[i].long];
    }
  }
  if (coordinatesTemp[0] == -1000 || coordinatesTemp[1] == -1000) {
    locationAPI = await getLocationsAPI(tweet.user.location);
    if (locationAPI == [] || locationAPI[0] == undefined || locationAPI[0] == -2000 || locationAPI[1] == -2000) {
      coordinatesTemp = [-3000, -3000];
    } else {
      addLocationsDB(tweet.user.location, locationAPI[0].latitude, locationAPI[0].longitude);
      coordinatesTemp = [locationAPI[0].latitude, locationAPI[0].longitude];
    }
  }
  //console.log(coordinatesTemp);
  return coordinatesTemp;
}

/* Anfrage an DB für Koordinaten einer Location */
async function getLocationsDB() {
  try {
      var url = urlDBLocations;
      const response = await fetch(url, {
          method: 'GET',
          credentials: 'same-origin'
        });
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(error);
    }
}

/* Fügt Location DB hinzu */
async function addLocationsDB(locationName, lat, long) {
  try {
    var data = { locationName: locationName, lat: lat, long: long };
    var dataJSON = JSON.stringify(data);
    var url = urlDBLocations;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        "Content-Type": "application/json"
      },
      body: dataJSON
      });
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(error);
    }
}

/* Anfrage an locationiq API für Koordinaten einer Location */
async function getLocationsAPI(name) {
  try {
    var url = urlAPILocation + name;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    const responseData = await response.json();
    return responseData;
    } catch (error) {
      console.error(error);
    }
}

//####################################################################################################################################
//####################################################################################################################################
//####################################################################################################################################

/* wählt Tweet aus
speichert gewählten Tweet, entfernt alle anderen Map Marker, markiert gewählten Tweet, zeigt Infos an,
zeigt Button um den Tweet zu öffnen, aktiviert Button um Satellitenbilder für gewählten Tweet zu finden
wenn gewählter Tweet gewählt -> Tweet nicht mehr gewählt */
function pickTweet() {
  clearMap();
  showTweetsOnMap();
  var selectedTweet =  this.id;
  var selectedTweetNumber = this.id.slice(-1);
  if (currentTweetPicked != selectedTweetNumber) {
    for (var i = 0; i < tweetparas.length; i++) {
      if (i != selectedTweetNumber) {
        tweetparas[i].style.backgroundColor = "inherit";
        map.removeLayer(markerList[i]);
      }
    }
    currentTweetPicked = selectedTweetNumber;
    tweetparas[selectedTweetNumber].style.backgroundColor = "lightgreen";
    markerList[selectedTweetNumber].openPopup();

    console.log(tweetsList[selectedTweetNumber]);
    var geo = "N/A"
    if (tweetsList[selectedTweetNumber].geo != undefined) {
      geo = tweetsList[selectedTweetNumber].geo.coordinates;
    }
    var text = tweetsList[selectedTweetNumber].text + " <br> Erstellungszeitpunkt: " + tweetsList[selectedTweetNumber].created_at + " <br> geo: " + geo + " <br> location: " + tweetsList[selectedTweetNumber].user.location + "<br> Antwort auf: " + tweetsList[selectedTweetNumber].in_reply_to_status_id;
    p10.innerHTML = text;
    tweetLink = "https://twitter.com/" + tweetsList[selectedTweetNumber].user.screen_name + "/status/" + tweetsList[selectedTweetNumber].id_str;
    buttonLink.style.display = "block";
    buttonSat.disabled = false;
  } else {
    unPickTweet();
    currentTweetPicked = -1;
  }
}
  /* entwählt Tweet */
function unPickTweet() {
  clearMap();
  showTweetsOnMap();
  currentTweetPicked = -1;
  p10.innerHTML = "";
  tweetLink = "";
  buttonLink.style.display = "none";
  buttonSat.disabled = true;
  for (var i = 0; i < tweetparas.length; i++) {
    tweetparas[i].style.backgroundColor = "inherit";
  }
}

/* öffnet Tweet in neuem Tab, wenn einer gewählt */
function openLink() {
  if (tweetLink != "") {
    window.open(tweetLink, "_blank").focus();
  }
}

//####################################################################################################################################
//##########   Satellitenbilder   ####################################################################################################
//####################################################################################################################################

/* gibt Datum zurück, errechnet aus Datum und Abstand in Tagen */
function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/* Sortiert 2D Array */
function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

/* nimmt Datum
konvertiert dieses in ISO Format
gibt zwei Daten zurück, [timespan] vor und nach dem Datum */
function convertTime(time) {
  var date = new Date(time);
  var dateA = addDays(date, -timespan);
  var dateB = addDays(date, timespan);
  var dateAISO = dateA.toISOString();
  var dateBISO = dateB.toISOString();
  return [dateAISO, dateBISO];
  //console.log(date);
  //console.log(dateAISO);
  //console.log(dateBISO);
}

/* Anfrage nach Satellitenbildern
An DB, copernicus API, Planet API */
async function getSatelliteImages() {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~PREP~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  clearMap();
  pageTiles = 1;
  dbIDs = [];
  copernicusIDs = [];
  planetIDs = [];
  mapTilesIDs = [];
  var latCurrent = tweetsList[currentTweetPicked].geo.coordinates[0];
  var longCurrent = tweetsList[currentTweetPicked].geo.coordinates[1];
  var date = convertTime(tweetsList[currentTweetPicked].created_at);
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Database~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var dbSearchRes = await searchDB();
  console.log(dbSearchRes);
  for (var i = 0; i < dbSearchRes.length; i++) {
    dbIDs.push([dbSearchRes[i].mapTileID, dbSearchRes[i].status]);
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~copernicus~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var copernicusSearchRes = await searchCopernicus(latCurrent, longCurrent, date[0], date[1], maxCloudCover / 10);
  console.log(copernicusSearchRes);
  if (copernicusSearchRes.feed.entry != undefined) {
    for (var i = 0; i < copernicusSearchRes.feed.entry.length; i++) {
      var polygon = [];
      var polygonText = copernicusSearchRes.feed.entry[i].str[2]._text.substring(16, copernicusSearchRes.feed.entry[i].str[2]._text.length -3);
      var polygonText2 = polygonText.split(", ");
      for (var j = 0; j < polygonText2.length; j++) {
        var polygonText3 = polygonText2[j].split(" ");
        polygon.push([parseFloat(polygonText3[1]), parseFloat(polygonText3[0])]);
      }
      status = "downloadable";
      for (var j = 0; j < dbIDs.length; j++) {
        if (dbIDs[j][0] == copernicusSearchRes.feed.entry[i].id._text) {
          status = dbIDs[1];
        }
      }
      copernicusIDs.push(["copernicus", copernicusSearchRes.feed.entry[i].id._text, status, copernicusSearchRes.feed.entry[i].date[2]._text, polygon]);
    }
  } else {
    console.log("No copernicus data found");
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Planet~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var planetSearchRes = await searchPlanet(latCurrent, longCurrent, date[0], date[1], maxCloudCover / 10);
  console.log(planetSearchRes);
  if (planetSearchRes.features != undefined) {
    for (var i = 0; i < planetSearchRes.features.length; i++) {
      var polygon = [];
      var polygonTemp = [];
      var polygonTempSorted = [];
      var totalLat = 0;
      var avgLat = 0;
      var totalLong = 0;
      var avgLong = 0;
      for (var j = 0; j < planetSearchRes.features[i].geometry.coordinates[0].length; j++) {
        if (planetSearchRes.features[i].geometry.coordinates[0][j] != undefined) {
          polygonTemp.push(planetSearchRes.features[i].geometry.coordinates[0][j]);
          console.log(polygonTemp);
          totalLat = totalLat + polygonTemp[j][0];
          totalLong = totalLong + polygonTemp[j][1];
        } else {
          console.log(polygonTemp);
          console.log(planetSearchRes.features[i] + i);
        }
      }
      avgLat = totalLat / polygonTemp.length;
      avgLong = totalLong / polygonTemp.length;
      for (var j = 0; j < polygonTemp.length; j++) {
        var angle = Math.atan2( avgLong - polygonTemp[j][1], avgLat - polygonTemp[j][0]) * ( 180 / Math.PI );
        polygonTempSorted[j] = [angle, polygonTemp[j]];
      }
      //console.log(polygonTempSorted);
      polygonTempSorted.sort(sortFunction);
      //console.log(polygonTempSorted);
      for (var j = 0; j < polygonTempSorted.length; j++) {
        polygon[j] = polygonTempSorted[j][1];
      }
      status = "orderable";
      for (var j = 0; j < dbIDs.length; j++) {
        if (dbIDs[j][0] == planetSearchRes.features[i].id) {
          status = dbIDs[j][1];
        }
      }
      planetIDs.push(["planet", planetSearchRes.features[i].id, status, planetSearchRes.features[i].properties.acquired, latLongSwitch(polygon)]);
    }
  } else {
    console.log("No planet data found");
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Combine~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  console.log(copernicusIDs);
  console.log(planetIDs);
  if (copernicusIDs != []) {
    for (var i = 0; i < copernicusIDs.length; i++) {
      mapTilesIDs.push(copernicusIDs[i]);
    }
  }
  if (planetIDs != []) {
    for (var i = 0; i < planetIDs.length; i++) {
      mapTilesIDs.push(planetIDs[i]);
    }
  }
  console.log(mapTilesIDs);
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~UI~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  maxPageTiles = Math.ceil(mapTilesIDs.length / 10);
  updatePageCounterTiles();
}

/* Anfrage an Db für MapTiles */
async function searchDB() {
  try {
      var url = urlDBMapTiles;
      const response = await fetch(url, {
          method: 'GET',
          credentials: 'same-origin'
        });
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error(error);
    }
}

/* Anfrage an Copernicus API für MapTiles */
async function searchCopernicus(lat, long, dateA, dateB, maxCloudCover) {
  try {
    var url = urlAPICopernicusSearch + lat + "/" + long + "/" + dateA + "/" + dateB + "/" + maxCloudCover;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    const responseData = await response.json();
    //var responseDataT = responseData.replace("<?xml version=\"1.0\" encoding=\"utf-8\"?>", "");
    //var responseDataT2 = xml2json(parseXml(responseDataT));
    //var responseDataJSON = JSON.parse(xml2json(parseXml(responseDataT)));
    return responseData;
    } catch (error) {
      console.error(error);
    }
}

/* Anfrage an Planet API für MapTilesS */
async function searchPlanet(lat, long, dateA, dateB, maxCloudCover) {
  try {
    var url = urlAPIPlanetSearch + lat + "/" + long + "/" + dateA + "/" + dateB + "/" + maxCloudCover;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    const responseData = await response.json();
    return responseData;
    } catch (error) {
      console.error(error);
    }
}

/* Anfrage für Download eines MapTiles an Copernicus API mit ID */
async function copernicusMapTiles(uuid) {
  console.log("downloading " + uuid);
  /*
  try {
    var url = copernicusMapTiles + uuid;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    const responseData = await response.blob();
    console.log(responseData);
    //var responseDataT = responseData.replace("<?xml version=\"1.0\" encoding=\"utf-8\"?>", "");
    //var responseDataT2 = xml2json(parseXml(responseDataT));
    //var responseDataJSON = JSON.parse(xml2json(parseXml(responseDataT)));
    return responseData;
    } catch (error) {
      console.error(error);
    }*/
}

/* Anfrage für Download eines MapTiles an Planet API mit ID */
async function planetMapTiles(uuid) {
  console.log("downloading " + uuid);
}

/* Anfrage für Order eines MapTiles an Planet API mit ID */
async function planetOrder(uuid) {
  console.log("ordering " + uuid);
}

/* Anfrage an Planet API um Status der Order zu aktualisieren */
async function refreshStatus(uuid) {
  console.log("refreshing orderstatus of " + uuid);
}

/* Download MapTile */
function downloadMapTile() {
  console.log(mapTilesIDs[pickedTile]);
  if (status !== "error") {
    if (status === "downloadable") {
      if (mapTilesIDs[pickedTile][0] === "copernicus") {
        copernicusMapTiles(mapTilesIDs[pickedTile][1]);
      } else {
        if (mapTilesIDs[pickedTile][0] === "planet") {
          planetMapTiles(mapTilesIDs[pickedTile][1]);
        } else {
          console.log("error");
        }
      }
    } else {
      if (status === "downloaded") {
        showMapTile(mapTilesIDs[pickedTile][1]);
      } else {
        if (status === "orderable") {
          planetOrder(mapTilesIDs[pickedTile][1]);
        } else {
          if (status === "ordered") {
            refreshStatus(mapTilesIDs[pickedTile][1]);
          } else {
            console.log("Download Error");
          }
        }
      }
    }
  } else {
    console.log("Download Error");
  }
}

/* nächste Seite der MapTileliste */
function nextTiles() {
  pageTiles++;
  updatePageCounterTiles();
  linkTileButtons();
}
/* vorherige Seite der MapTileliste */
function prevTiles() {
  pageTiles--;
  updatePageCounterTiles();
  linkTileButtons();
}
/* Setzt Seitenzähler für MapTiles */
function updatePageCounterTiles() {
  pageCounterTiles.innerHTML = pageTiles + " / " + maxPageTiles;
  if (pageTiles <= 1) {
    prevTilesButton.disabled = true;
  } else {
    prevTilesButton.disabled = false;
  }
  if (pageTiles >= maxPageTiles) {
    nextTilesButton.disabled = true;
  } else {
    nextTilesButton.disabled = false;
  }
  linkTileButtons();
}

/* Setzt Buttons entsprechend der MapTile Liste */
function linkTileButtons() {
  for (var i = 0; i < tilesList.length; i++) {
    var currentPos = pageTiles * 10 + i -10;
    if (mapTilesIDs[currentPos] != undefined) {
      if (currentPos < 10 && currentPos > -1) {
        currentPos = "0" + currentPos;
      }
      tilesList[i].innerHTML = currentPos;
      tilesList[i].disabled = false;
    } else {
      tilesList[i].disabled = true;
      tilesList[i].innerHTML = "__";
    }
  }
}
/* Wählt MapTile aus
speichert gewählte MapTile, zeigt Infos an, Zeigt Footprint als Polygon auf Map an */
function pickTile() {
  clearMap();

  //console.log(this.id);
  var pickedTileButton = parseInt(this.id.slice(-1), 10);
  console.log(pickedTileButton);
  for (var i = 0; i < tilesList.length; i++) {
    if (i == pickedTileButton || tilesList[i].innerHTML == "__") {
      tilesList[i].disabled = true;
    } else {
      tilesList[i].disabled = false;
    }
  }
  pickedTile = pickedTileButton + (10 * pageTiles) - 10;
  //console.log(pickedTile);
  //console.log(mapTilesIDs);
  var polygon = [];
  var mapTilesText = mapTilesIDs[pickedTile][0] + "<br>" + mapTilesIDs[pickedTile][1] + "<br>" + mapTilesIDs[pickedTile][2] + "<br>" + mapTilesIDs[pickedTile][3];
  buttonDownload.style.display = "inline";
  status = mapTilesIDs[pickedTile][2];
  buttonDownload.disabled = false;
  if (status !== "error") {
    if (status === "downloadable") {
      buttonDownload.innerHTML = "Download";
    } else {
      if (status === "downloaded") {
        buttonDownload.innerHTML = "Anzeigen";
      } else {
        if (status === "orderable") {
          buttonDownload.innerHTML = "Order";
        } else {
          if (status === "ordered") {
            buttonDownload.innerHTML = "Bestellung wird bearbeitet";
            buttonDownload.disabled = true;
          } else {
            buttonDownload.innerHTML = "error";
            buttonDownload.disabled = true;
          }
        }
      }
    }
  } else {
    buttonDownload.innerHTML = "error";
    buttonDownload.disabled = true;
  }


  for (var i = 0; i < mapTilesIDs[pickedTile][4].length; i++) {
    mapTilesText = mapTilesText + "<br>" + mapTilesIDs[pickedTile][4][i];
    polygon.push([mapTilesIDs[pickedTile][4][i][1], mapTilesIDs[pickedTile][4][i][0]]);
  }
  console.log(mapTilesIDs[pickedTile][4]);
  mapTileInfo.innerHTML = mapTilesText;
  //copernicusMapTiles("dc52e819-40ba-4a7b-988c-e003adcd560a");
  polygonOnMap = new L.polygon([polygon]).addTo(map);
  polygonDrawn = true;
}

/* entfernt Polygon von Map, falls eins vorhanden ist */
function clearMap() {
  if (polygonDrawn) {
    map.removeLayer(polygonOnMap);
    polygonDrawn = false;
  }
}

/* setzt Timespan nach Werten, die der Nutzer eingegeben hat */
function setTimespan() {
  if (timespanInput.value >= 0 && timespanInput.value <= 30) {
    timespan = timespanInput.value;
    updateText2();
  } else {
    alert("Zeitspanne muss zwischen 0 und 30 liegen");
  }
}

/* setzt maxCloudCover nach Werten, die der Nutzer eingegeben hat */
function setmaxCloudCover() {
  if (maxCloudCoverInput.value >= 0 && maxCloudCoverInput.value <= 100) {
    maxCloudCover = maxCloudCoverInput.value;
    updateText2();
  } else {
    alert("Maximale Wolkenbedeckung muss zwischen 0 und 100 liegen");
  }
}
/* UI Update */
function updateText2() {
  text3.innerHTML = "Erstellungszeitpunkt " + timespan + " Tage vor/nach der Erstellung des Posts";
  text4.innerHTML = "Maximal " + maxCloudCover + " % Wolkenbedeckung";
}

/* Zeigt Map Tiles an */
function showMapTile(uuid) {
  console.log("showing maptile");
  if (imageOverlayed === true) {
    map.removeLayer(imageOverlay);
  }
  imageUrl = "https://localhost:3000/mapTiles/" + uuid + ".png";
  errorOverlayUrl = 'https://cdn-icons-png.flaticon.com/512/110/110686.png';
  altText = "test";
  latLngBounds = L.latLngBounds(mapTilesIDs[pickedTile][4]);
  imageOverlay = L.imageOverlay(imageUrl, latLngBounds, {
      opacity: 1,
      errorOverlayUrl: errorOverlayUrl,
      alt: altText,
      interactive: true
  }).addTo(map);
  imageOverlayed = true;
}

//####################################################################################################################################
//####################################################################################################################################
//####################################################################################################################################
