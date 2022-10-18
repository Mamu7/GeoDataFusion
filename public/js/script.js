//####################################################################################################################################
//#######   VAR   ####################################################################################################################
//####################################################################################################################################

//URLs
const urlDBTweet = "https://localhost:3000/tweet/";                                   //URL Datenbankverbindung Tweets
const urlDBLocations = "https://localhost:3000/locations/";                           //URL Datenbankverbindung Locations
const urlDBMapTiles = "https://localhost:3000/mapTilesDB/"                            //URL Datenbankverbindung mapTiles
const urlAPITweet = "https://localhost:3000/tweets/";                                 //URL API Anbindung Tweets
const urlAPILocation = "https://localhost:3000/geocoding/";                           //URL API Anbindung Locations
const urlAPICopernicusSearch = "https://localhost:3000/copernicusSearch/";            //URL API Anbindung copernicus Suche
const urlAPICopernicusMapTiles = "https://localhost:3000/copernicusMapTiles/";        //URL API Anbindung copernicus mapTiles
const urlAPIPlanetSearch = "https://localhost:3000/planetSearch/";                    //URL API Anbindung Planet Suche
const urlAPIPlanetOrders = "https://localhost:3000/planetOrders/";                    //URL API Anbindung Planet Order
const urlAPIPlanetOrder = "https://localhost:3000/planetOrder/";                      //URL API Anbindung Planet Order
const urlAPIPlanetMapTiles = "https://localhost:3000/planetMaptiles/";                //URL API Anbindung Planet mapTiles
const urlAPIPlanetDownload = "https://localhost:3000/planetDownload/";                //URL API Anbindung Planet mapTiles
const urlDownloading = "https://localhost:3000/downloading/";                         //URL Anbindung Downloadstatus Server

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
var pStyle = {
  "color": "#ffffff",
  "fillOpacity": 0 };

var map = L.map('map').setView([49.5, 32.0], 6);                                //setzt Parameter für Karte
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);                                                                  //Fügt Hintergrund zur Karte hinzu

button1.addEventListener("click", setUserRadius, false);
map.on('click', onMapClick);
var polygonOnMap;
var imageOverlayed = false;
var imageOverlay;
//----------------------------------Variablen-------------------------------------------------------------
var tweetsObj;
var tweetsDBObj;
var tweets = [];
var tweetsDB = [];
var tweetsList = [];
var prevButton = document.getElementById("prev");                 //HTML Elemente die abgerufen werden
var nextButton = document.getElementById("next");                 //      |
var button2 = document.getElementById("button2");                 //     \/
var buttonSingleTweet = document.getElementById("buttonSingleTweet");
var inputSingleTweet = document.getElementById("inputSingleTweet");
var buttonSat = document.getElementById("buttonSat");
var buttonLink = document.getElementById("buttonLink");
var buttonDownload = document.getElementById("buttonDownload");
var buttonTime = document.getElementById("buttonTime");
var buttonClouds = document.getElementById("buttonClouds");
var timespanInput = document.getElementById("input2");
var maxCloudCoverInput = document.getElementById("input3");
var text2 = document.getElementById("text2");
var progressText = document.getElementById("progressText");
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
buttonSingleTweet.addEventListener("click", addTweetByID, false);
prevButton.addEventListener("click", previous, false);
nextButton.addEventListener("click", next, false);
buttonLink.addEventListener("click", openLink, false);
buttonDownload.addEventListener("click", downloadMapTile, false);
buttonSat.addEventListener("click", getSatelliteImages, false);
buttonTime.addEventListener("click", setTimespan, false);
buttonClouds.addEventListener("click", setmaxCloudCover, false);
var tweetButton0 = document.getElementById("tweetButton0");
var tweetButton1 = document.getElementById("tweetButton1");
var tweetButton2 = document.getElementById("tweetButton2");
var tweetButton3 = document.getElementById("tweetButton3");
var tweetButton4 = document.getElementById("tweetButton4");
var tweetButton5 = document.getElementById("tweetButton5");
var tweetButton6 = document.getElementById("tweetButton6");
var tweetButton7 = document.getElementById("tweetButton7");
var tweetButton8 = document.getElementById("tweetButton8");
var tweetButton9 = document.getElementById("tweetButton9");
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
var tweetButtons = [tweetButton0, tweetButton1, tweetButton2, tweetButton3, tweetButton4, tweetButton5, tweetButton6, tweetButton7, tweetButton8, tweetButton9];
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
var tweetTables = [];
for (var i = 0; i < 10; i++) {
  tweetTables[i] = document.getElementById("tweetTable" + i);
}
var tweetAttributes = [[], [], [], [], [], [], [], [], [], []];
for (var i = 0; i < 10; i++) {
  for (var j = 0; j < 6; j++) {
    tweetAttributes[i][j] = document.getElementById("tweetAttr" + i + j);
  }
}
var tablePlatform = document.getElementById("tablePlatform");
var tableID = document.getElementById("tableID");
var tableStatus = document.getElementById("tableStatus");
var tableTime = document.getElementById("tableTime");
var tableCoordinates = document.getElementById("tableCoordinates");
var pageCounter = document.getElementById("pageCounter");
var pageCounterTiles = document.getElementById("pageCounterTiles");
var tableRadius = document.getElementById("tableRadius");
var tableLat = document.getElementById("tableLat");
var tableLong = document.getElementById("tableLong");
var tableTimespan = document.getElementById("tableTimespan");
var tableCloudCover = document.getElementById("tableCloudCover");
var progressBarOut = document.getElementById("progressBarOut");
var progressBarIn = document.getElementById("progressBarIn");//-----------------------
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
var currentTweetPicked = -1;
var tweetLink = "";
var timespan = 5;
var maxCloudCover = 50;
var dbIDs = [];
var copernicusIDs = [];
var planetIDs = [];
var mapTilesIDs = [];
var pageTiles = 1;
var maxPageTiles = Math.ceil(copernicusIDs.length / 10);
var currentTilePicked = -1;
var polygonDrawn = false;
var pickedTile = "";
var downloadingCopernicus = 0;
var downloadingPlanet = 0;
var status = "error";
var progressBarWidth = 0;


function latLongSwitch(coordinates) {                     //Wechselt Reihenfolge der Koordinaten, da diese nicht immer Einheitlich ist.
  var newCoordinates;
  if (Array.isArray(coordinates[0])) {                    //für Arrays von Koordinaten
    newCoordinates = [];
    for (var i = 0; i < coordinates.length; i++) {
      var l1 = coordinates[i][0];
      var l2 = coordinates[i][1];
      newCoordinates.push([l2, l1]);
    }
  } else {                                               //für eine Koordinate
    var l1 = coordinates[0];
    var l2 = coordinates[1];
    newCoordinates = [l2, l1];
  }
  return newCoordinates;
}

function alertParameterError(parameter, min, max) {       //Zeigt Error popup für falsch gesetzte Parameter
  var text = parameter + " muss zwischen " + min + " und " + max + " liegen!";
  Swal.fire({
    title: 'Error!',
    text: text,
    icon: 'error',
    confirmButtonText: 'OK'
  })
}

function alertTweetsFound(tweetNumber, nrInDB) {        //Info über gefundene Tweets
  var infoMessage = "Es wurden <b>" + tweetNumber + "</b> Tweets gefunden, davon <b>" + nrInDB + "</b> in der Datenbank!";
  Swal.fire({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    icon: "info",
    title: "Tweets",
    html: infoMessage,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
 }})
}

function alertSatsFound(satsNrTotal, satsNrCopernicus, satsNrPlanet) {      // Info über gefundene Satellitenbilder
  var infoMessage = "Es wurden <b>" + satsNrTotal + "</b> Satellitenbilder gefunden, davon <b>" + satsNrCopernicus + "</b> bei Copernicus und <b>" + satsNrPlanet + "</b> bei Planet!";
  Swal.fire({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    icon: "info",
    title: "Satellitenbilder",
    html: infoMessage,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
 }})
}

function alertGenericError(message) {       //Zeigt popup für sonstige Fehler
  Swal.fire({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: "error",
    title: "Fehler!",
    text: message,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
 }})
}
function alertGenericSuccess(message) {       //Zeigt popup für sonstige Erfolge
  Swal.fire({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: "success",
    title: "Erfolg!",
    text: message,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
 }})
}
function alertGenericInfo(message) {       //Zeigt popup für sonstige Infos
  Swal.fire({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: "info",
    title: "Info",
    text: message,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
 }})
}
//-------------------------------------------Geocoding--------------------------------------------------------
var locations = [];                                                             //Liste der Locations der Twitter user (Name + Koordinaten) aus DB

//####################################################################################################################################
//#######   Map   ####################################################################################################################
//####################################################################################################################################

/* UI Update */
function updateText() {                                                         //Setzt Text:
  text1.innerHTML = "Auf die Karte klicken um Area of Interest mit Radius von " + radius + " km zu setzen!"
  if (centerLat == -1000 || centerLong == -1000) {                              //wenn keine Area of Interest gesetz wurde:
    tableRadius.innerHTML = radius + " km";
    tableLat.innerHTML = "";
    tableLong.innerHTML = "";
  } else {                                                                      //wenn eine AOI gesetz wurde:
    button2.disabled = false;                                                   //aktiviert Button zur Tweetsuche
    tableRadius.innerHTML = radius + " km";
    tableLat.innerHTML = centerLat;
    tableLong.innerHTML = centerLong;
  }
}

/* setzt AOI an angeklickte Stelle mit aktuellem radius */
function onMapClick(e) {
  centerLat = e.latlng.lat;
  centerLong = e.latlng.lng;
  map.removeLayer(circle);
  circle = new L.circle(e.latlng, {radius : radius * 1000, fillOpacity: 0});                    //erstellt Kreis zur Visualisierung
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
    alertParameterError("Radius", 1, 500);                                      //sonst error
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
  page = 1;
  for (var i = 0; i < tweetsDBObj.length; i++) {                                //Tweets aus DB in Liste speichern, wenn diesenin AOI sind
    if (getDistanceFromLatLonInKm(centerLat, centerLong, tweetsDBObj[i].lat, tweetsDBObj[i].long) < radius) {
      if (tweetsDBObj[i].tweetObject.geo == null) {
        var coordinates = [tweetsDBObj[i].lat, tweetsDBObj[i].long];
        var geo = { coordinates };
        tweetsDBObj[i].tweetObject.geo = geo;
      }
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
        addTweetsDB(tweetsObj.statuses[i], tweetsObj.statuses[i].geo.coordinates[0], tweetsObj.statuses[i].geo.coordinates[1]);//hinzufügen
      } else {                                                                  //wenn keine Geodaten vorhanden:
        var locationObj = await getCoordinatesOfLocation(tweetsObj.statuses[i]);//Koordinaten über locationiq API erhalten
        if (locationObj != [] && locationObj[0] != undefined) {
          if (locationObj[0] != undefined && locationObj[0] != undefined) {
            var coordinates = [locationObj[0], locationObj[1]];
            var geo = { coordinates };
            tweetsObj.statuses[i].geo = geo;
          } else {
            alertGenericError("Keine Koordinaten für Tweet NR " + i + " gefunden!");
          }
        }else {
          alertGenericError("Kein Ortsname für Tweet NR " + i + " gefunden!");
        }
      }
      if (tweetsObj.statuses[i].user.location != "YAMA" && tweetsObj.statuses[i].user.location != "PRISTIN" && tweetsObj.statuses[i].user.location != "Surabaya, INDONESIA") {  //Tweets aus Japan und Thailand rausfiltern
        tweets.push(tweetsObj.statuses[i]);
      }
    }
  }
  tweetsList = tweetsDB.concat(tweets);                                         //beide Listen zusammenfügen
  alertTweetsFound(tweetsList.length, tweetsDB.length);                         //Zeigt Ergebnis als popup
  maxPage = Math.ceil(tweetsList.length / 10);                                  //Anzahl an Seiten für Tweets setzten
  updatePageCounter();                                                          //UI updaten
  showTweets();                                                                 //Tweets anzeigen
}

// GET TWEETS API --------------------------------------------------------------------------------------
/* getTweetsAPIH + getTweetsAPI:
Anfrage an Twitter API für Tweets in AOI (7 Tage zurück) */
async function getTweetsAPIH() {
  try {
    var url = urlAPITweet + centerLat + "/" + centerLong + "/" + radius;
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
  //addTweetsDB(tweet, tweet.geo.coordinates[0], tweet.geo.coordinates[1]);
  return tweet;
}

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
  return tweetsDBTemp;
}
//-------------------------------------------------------------------------------------------------------
// ADD SINGLE TWEET DB
/* getSingleTweetDBH + getSingleTweetDB:
Anfrage an DB für Tweets, überprüft ob übergebene ID in DB ist, gibt boolean zurück
 */
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
    if (tweetsDB[i].tweetObject.id_str == id) {
      idFound = true;
    }
  }
  return idFound;
}

/* Wie getSingleTweetDB, aber checkt ob Geodaten vorhanden sind */
async function getSingleTweetDBGeo(id) {
  tweetsDB = await getSingleTweetDBH();
  var idFound = false;
  for (var i = 0; i < tweetsDB.length; i++) {
    if (tweetsDB[i].tweetObject.id_str == id) {
      if (isNaN(tweetsDB[i].lat) || isNaN(tweetsDB[i].long)) {
        idFound = false;
      } else {
        if (tweetsDB[i].lat > 90 || tweetsDB[i].lat < -90 || tweetsDB[i].long > 180 || tweetsDB[i].long < -180) {
          idFound = false;
        } else {
          idFound = true;
        }
      }
    }
  }
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
      method: 'PUT',
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
}
//-------------------------------------------------------------------------------------------------------
//Tweets anzeigen
/* Zeigt 10 Tweets auf Seite an
Zeigt Text, Erstellungszeitpunkt, Koordinate, locationName */
function showTweets() {
  for (var i = 0; i < tweetAttributes.length; i++) {
    var pos = i + ((page - 1) * 10);
    if (tweetsList[pos] != undefined) {
      var geo = "N/A";
      if (tweetsList[pos].geo != undefined && tweetsList[pos].geo.coordinates[0] != -3000 && tweetsList[pos].geo.coordinates[1] != -3000) {
        geo = tweetsList[pos].geo.coordinates;                  //Setzt Geodaten falls vorhanden
      }
      var geotagging = "Nein";                                  //Setzt Styles der Tweet Tabellen
      tweetButtons[i].style.backgroundColor = "white";          //     |
      tweetButtons[i].style.display = "block";                  //    \/
      if (tweetsList[pos].geo != null && tweetsList[pos].geo.type === "Point") {
        geotagging = "Ja";
        tweetTables[i].style.border = "3px solid lightblue";
        tweetButtons[i].style.backgroundColor = "lightblue";
        tweetButtons[i].style.border = "1px solid lightblue";
      } else {
        tweetTables[i].style.border = "1px solid black";
        tweetButtons[i].style.backgroundColor = "lightseagreen";
        tweetButtons[i].style.border = "1px solid black";
      }
      var userLocation = "N/A";
      if (tweetsList[pos].user.location !== "") {
        userLocation = tweetsList[pos].user.location;
      }
      tweetTables[i].style.display = "block";
      tweetAttributes[i][0].innerHTML = tweetsList[pos].text;                   // Fügt Werte den Tabellen hinzu
      tweetAttributes[i][1].innerHTML = tweetsList[pos].user.name + " (" + tweetsList[pos].user.id_str + ")";
      tweetAttributes[i][2].innerHTML = tweetsList[pos].created_at;
      tweetAttributes[i][3].innerHTML = geo;
      tweetAttributes[i][4].innerHTML = userLocation;
      tweetAttributes[i][5].innerHTML = geotagging;
      tweetparas[i].style.display = "block";
      var tweetNR = pos + 1;
      tweetparas[i].innerHTML = "Tweet " + tweetNR;
    } else {
      tweetTables[i].style.display = "none";
      tweetparas[i].style.display = "none";
      tweetButtons[i].style.display = "none";
    }
  }
  unPickTweet();      //enfernt Tweet Wahl
  showTweetsOnMap();  //Zeigt Tweets auf Karte
}


/* Zeigt Tweets auf Map an
Setzt Marker für 10 Tweets */
async function showTweetsOnMap() {
  for (var i = 0; i < markerList.length; i++) {
    var pos = i + ((page - 1) * 10);
    var tweetNR = pos + 1;
    map.removeLayer(markerList[i]);
    if (tweetsList[pos] != undefined) {
      if (tweetsList[pos].geo == undefined || tweetsList[pos].geo.coordinates[0] == -3000 || tweetsList[pos].geo.coordinates[1] == -3000) {
        alertGenericError("Keine Geodaten für Tweet NR " + tweetNR + "gefunden");
      } else {
        markerList[i].setLatLng(tweetsList[pos].geo.coordinates);
        markerList[i].bindPopup("Tweet " + tweetNR).openPopup();
        map.addLayer(markerList[i]);
      }
    }
  }
}
/* Fügt einen Tweet der Datenbank hinzu */
async function addTweetByID() {
  var inputID = inputSingleTweet.value;
  inputSingleTweet.value = "";
  var tweetInDB = await getSingleTweetDBGeo(inputID);
  var tweetExists = false;
  if (tweetInDB == false) {
    tweetExists = await getSingleTweet(inputID);
    if (tweetExists != false) {
      var geo = [-1000, -1000];
      if (tweetExists.geo != undefined) {
        geo[0] = tweetExists.geo.coordinates[0];
        geo[1] = tweetExists.geo.coordinates[1];
      } else {
        geo = await getCoordinatesOfLocation(tweetExists);
        var coordinates = geo;
        var geoTemp = { coordinates };
        tweetExists.geo = geoTemp
      }
      addTweetsDB(tweetExists, geo[0], geo[1]);
      alertGenericSuccess("Der Tweet wurde zur Datenbank hinzugefügt");
    } else {
      alertGenericError("Es wurde kein Tweet mit dieser ID gefunden");
    }
  } else {
    alertGenericInfo("Dieser Tweet ist bereits in der Datenbank");
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
  for (var i = 0; i < locations.length; i++) {                    //Vergleich: Locations aus DB
    if (locations[i].locationName == tweet.user.location) {
      coordinatesTemp = [locations[i].lat, locations[i].long];
    }
  }
  if (coordinatesTemp[0] == -1000 || coordinatesTemp[1] == -1000) {
    locationAPI = await getLocationsAPI(tweet.user.location);
    if (locationAPI == [] || locationAPI == undefined) {                //Vergleich: Locations der API
      coordinatesTemp = [-3000, -3000];
    } else {
      if (locationAPI[0] == undefined || locationAPI[0] == -2000 || locationAPI[1] == -2000) {
        coordinatesTemp = [-3000, -3000];
      } else {
        addLocationsDB(tweet.user.location, locationAPI[0].latitude, locationAPI[0].longitude);   //Fügt neue Locations zur DB hinzu
        coordinatesTemp = [locationAPI[0].latitude, locationAPI[0].longitude];
      }
    }
  }
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
  if (name != "") {
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
}

//####################################################################################################################################
//##########   Tweet wählen   ########################################################################################################
//####################################################################################################################################

/* wählt Tweet aus
speichert gewählten Tweet, entfernt alle anderen Map Marker, markiert gewählten Tweet, zeigt Infos an,
zeigt Button um den Tweet zu öffnen, aktiviert Button um Satellitenbilder für gewählten Tweet zu finden
wenn gewählter Tweet gewählt -> Tweet nicht mehr gewählt */
function pickTweet() {
  clearMap();
  showTweetsOnMap();
  var selectedTweet =  this.id.slice(-1);
  var selectedTweetNumber = parseInt(selectedTweet) + ((page - 1) * 10);;
  if (currentTweetPicked != selectedTweetNumber) {
    for (var i = 0; i < tweetTables.length; i++) {
      var pos = i + ((page - 1) * 10);
      if (pos != selectedTweet) {
        if (tweetsList[pos] !== undefined) {
          if (tweetsList[pos].geo != null && tweetsList[pos].geo.type !== undefined) {
            tweetTables[i].style.border = "3px solid lightblue";
            tweetButtons[i].style.backgroundColor = "lightblue";
            tweetButtons[i].style.border = "1px solid lightblue";
          } else {
            tweetTables[i].style.border = "0px solid black";
            tweetButtons[i].style.backgroundColor = "white";
          }
        }
        map.removeLayer(markerList[i]);
      }
    }
    currentTweetPicked = selectedTweetNumber;
    tweetTables[selectedTweet].style.border = "3px solid lightgreen";
    tweetButtons[selectedTweet].style.backgroundColor = "lightgreen";
    markerList[selectedTweet].openPopup();
    map.addLayer(markerList[selectedTweet]);
    var geo = "N/A"
    if (tweetsList[selectedTweetNumber].geo != undefined) {
      geo = tweetsList[selectedTweetNumber].geo.coordinates;
    }
    tweetLink = "https://twitter.com/" + tweetsList[selectedTweetNumber].user.screen_name + "/status/" + tweetsList[selectedTweetNumber].id_str;
    buttonLink.style.display = "block";
    buttonLink.innerHTML = "Tweet " + (selectedTweetNumber + 1) + " öffnen";
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
  tweetLink = "";
  buttonLink.style.display = "none";
  buttonSat.disabled = true;
  for (var i = 0; i < tweetTables.length; i++) {
    var pos = i + ((page - 1) * 10);
    if (tweetsList[pos] !== undefined) {
      if (tweetsList[pos].geo != null && tweetsList[pos].geo.type === "Point") {
        tweetTables[i].style.border = "3px solid lightblue";
        tweetButtons[i].style.backgroundColor = "lightblue";
      } else {
        tweetTables[i].style.border = "0px solid black";
        tweetButtons[i].style.backgroundColor = "white";
      }
    } else {
      tweetTables[i].style.border = "0px solid black";
      tweetButtons[i].style.backgroundColor = "white";
      tweetTables[i].style.display = "none";
      tweetparas[i].style.display = "none";
      tweetButtons[i].style.display = "none";
    }
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
  var unix = Date.parse(result);
  var change = days * 86400000;
  var unixNew = unix + change;
  return unixNew;
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
  var dateAISO = new Date(dateA).toISOString();
  var dateBISO = new Date(dateB).toISOString();
  return [dateAISO, dateBISO];
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
  for (var i = 0; i < dbSearchRes.length; i++) {
    dbIDs.push([dbSearchRes[i].mapTileID, dbSearchRes[i].status]);
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~copernicus~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var copernicusSearchRes = await searchCopernicus(latCurrent, longCurrent, date[0], date[1], maxCloudCover);
  if (copernicusSearchRes.feed != undefined) {
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
            status = dbIDs[j][1];
          }
        }
        copernicusIDs.push(["copernicus", copernicusSearchRes.feed.entry[i].id._text, status, copernicusSearchRes.feed.entry[i].date[2]._text, polygon]);
      }
    } else {
      alertGenericError("Keine Copernicus Satellitenbilder gefunden");
    }
  } else {
    alertGenericError("Keine Copernicus Satellitenbilder gefunden");
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Planet~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var planetSearchRes = await searchPlanet(latCurrent, longCurrent, date[0], date[1], maxCloudCover / 10);
  if (planetSearchRes.features != undefined && planetSearchRes.features != "error") {
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
          totalLat = totalLat + polygonTemp[j][0];
          totalLong = totalLong + polygonTemp[j][1];
        }
      }
      avgLat = totalLat / polygonTemp.length;
      avgLong = totalLong / polygonTemp.length;
      for (var j = 0; j < polygonTemp.length; j++) {
        var angle = Math.atan2( avgLong - polygonTemp[j][1], avgLat - polygonTemp[j][0]) * ( 180 / Math.PI );
        polygonTempSorted[j] = [angle, polygonTemp[j]];
      }
      polygonTempSorted.sort(sortFunction);
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
    alertGenericError("Keine Planet Satellitenbilder gefunden");
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Combine~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~UI~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  alertSatsFound(mapTilesIDs.length, copernicusIDs.length, planetIDs.length);
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

/* Anfrage an Server nach Downloadstatus */
async function getDownloading() {
  try {
    var url = urlDownloading;
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
async function copernicusDownload(uuid) {
  try {
    var url = urlAPICopernicusMapTiles + uuid;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    const responseData = await response.text();
    return responseData;
    } catch (error) {
      console.error(error);
    }
}

/* Anfrage für Download eines MapTiles an Copernicus API mit ID */
async function copernicusMapTiles(uuid) {
  var downloading = await getDownloading();
  downloadingCopernicus = downloading[0];
  if (downloadingCopernicus.length <= 2) {
    var temp = await copernicusDownload(uuid);
    var finished = true;
    buttonDownload.disabled = true;
    progressText.style.display = "block";
    progressBarOut.style.display = "block";
    progressBarIn.style.display = "block";
    progressBarWidth = 0;
    checkDownload(uuid, "copernicus");
    if (temp !== "error") {
    } else {
      alertGenericError("Herunterladen von " + uuid + "fehlgeschlagen!");
    }
  } else {
    alertGenericError("Downloadkapazität erreicht");
  }
}

/* Download Planet */
async function planetDownload(id) {
  try {
    var url = urlAPIPlanetDownload + id;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
      });
    } catch (error) {
      console.error(error);
    }
}

/* Anfrage für Download eines MapTiles an Planet API mit ID */
async function planetMapTiles(uuid) {
  var downloading = await getDownloading();
  downloadingPlanet = downloading[1];
  if (downloadingPlanet.length <= 2) {
    buttonDownload.innerHTML = "downloading..."
    buttonDownload.disabled = true;
    for (var i = 0; i < tilesList.length; i++) {
      tilesList[i].disabled = true;
    }
    checkDownload(uuid, "planet");
    var temp = await planetDownload(uuid);
  } else {
    alertGenericError("Downloadkapazität erreicht");
  }
}

/* Progress bar */
function progressing(percent) {
  var width = progressBarWidth;
  var id = setInterval(frame, 10);
  function frame() {
    if (width >= percent) {
      clearInterval(id);
    } else {
      width++;
      progressBarIn.style.width = width + '%';
      progressBarWidth = width;
    }
  }
}
/* Downloadstatus Check */
async function checkDownload(uuid, service) {
  setTimeout(async function(){
    var stillRunning = false;
    var downloading = await getDownloading();
    if (service === "copernicus") {
      for (var i = 0; i < downloading[0].length; i++) {
        if (downloading[0][i][0] === uuid) {
          stillRunning = true;
          if (downloading[0][i][1] === "downloading") {
            progressText.innerHTML = "Dateien werden heruntergeladen..."
            progressing(10);
          } else if (downloading[0][i][1] === "unzipping") {
            progressText.innerHTML = "Dateien werden entpackt..."
            progressing(40);
          } else if (downloading[0][i][1].includes("converting")) {
            var conversionsDone = downloading[0][i][1].charAt(downloading[0][i][1].length - 1);
            progressText.innerHTML = "Dateien werden konvertiert...";
            progressing((parseInt(conversionsDone) * 10) + 40);
          } else if (downloading[0][i][1] === "merging") {
            progressText.innerHTML = "Kanäle werden zu Farbbild zusammengefügt..."
            progressing(90);
          }
          progressText.style.display = "block";
          progressBarOut.style.display = "block";
          progressBarIn.style.display = "block";
        }
      }

    } else if (service === "planet") {
      for (var i = 0; i < downloading[1].length; i++) {
        if (downloading[1][i][0] === uuid) {
          stillRunning = true;
          if (downloading[1][i][1] === "downloading") {
            progressText.innerHTML = "Dateien werden heruntergeladen..."
            progressText.style.display = "block";
            progressBarOut.style.display = "block";
            progressBarIn.style.display = "block";
            progressing(20);
          } else if (downloading[1][i][1] === "converting") {
            progressText.innerHTML = "Dateien werden konvertiert..."
            progressing(80);
          }
          progressText.style.display = "block";
          progressBarOut.style.display = "block";
          progressBarIn.style.display = "block";
        }
      }
    }
    if (stillRunning) {
      checkDownload(uuid, service);
    } else {
      alertGenericSuccess(uuid + "fertig heruntergeladen");
      progressText.innerHTML = "Fertig!"
      progressText.style.display = "none";
      progressBarOut.style.display = "none";
      progressBarIn.style.display = "none";
      buttonDownload.innerHTML = "Anzeigen";
      buttonDownload.disabled = false;
      mapTilesIDs[pickedTile][2] = "downloaded";
      pickTile(pickedTile);
    }
  }, 10000)
}

/* Anfrage für Order eines MapTiles an Planet API mit ID */
async function makePlanetOrder(id) {
  try {
    var url = urlAPIPlanetMapTiles + id;
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

/* Anfrage für Order eines MapTiles an Planet API mit ID */
async function planetOrder(uuid) {
  var temp = await makePlanetOrder(uuid);
  refreshStatus(uuid);
}

/*Anfrage an Planet API um Status der Order zu aktualisieren */
async function getOrderStatus(id) {
  try {
    var url = urlAPIPlanetOrder + id;
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

/* Anfrage an DB um Status zu aktualisieren */
async function updateOrderStatusDB(id, status) {
  var data = {mapTileID: id, status: status};
  var dataJSON = JSON.stringify(data);
  try {
    var url = urlDBMapTiles;
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        "Content-Type": "application/json"
      },
      body: dataJSON,
      });
    const responseData = await response.json();
    return responseData;
    } catch (error) {
      console.error(error);
    }
}

async function deleteFailedOrders(uuid) {
  var data = { mapTileID: uuid };
  var dataJSON = JSON.stringify(data);
  try {
      var url = urlDBMapTiles;
      const response = await fetch(url, {
          method: 'DELETE',
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

/* Anfrage an Planet API um Status der Order zu aktualisieren */
async function refreshStatus(uuid) {                            //TODO: refresh on load
  var order = await getOrderStatus(uuid);
  var state = order.state;
  if (state === "failed") {
    alertGenericError("Bestellung von " + uuid + "fehlgeschlagen!");
    deleteFailedOrders(uuid);
    buttonDownload.innerHTML = "Order";
    mapTilesIDs[pickedTile][2] = "orderable";
    pickTile(pickedTile);
  } else {
    if (state === "running" || state === "queued") {
      alertGenericInfo("Bestellung wird noch bearbeitet");
      mapTilesIDs[pickedTile][2] = "ordered";
      pickTile(pickedTile);
    } else {
      if (state === "success") {
        alertGenericSuccess("Bestellung bereit");
        mapTilesIDs[pickedTile][2] = "downloadable";
        updateOrderStatusDB(uuid, "downloadable");
        pickTile(pickedTile);
      } else {
        alertGenericError("Aktualisierung fehlgeschlagen");
      }
    }
  }
}

/* Download MapTile */
function downloadMapTile() {
  if (status !== "error") {
    if (status === "downloadable") {
      if (mapTilesIDs[pickedTile][0] === "copernicus") {
        copernicusMapTiles(mapTilesIDs[pickedTile][1]);
      } else {
        if (mapTilesIDs[pickedTile][0] === "planet") {
          planetMapTiles(mapTilesIDs[pickedTile][1]);
        } else {
          alertGenericError("MapTile Fehlerhaft");
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
            alertGenericError("Download Error");
          }
        }
      }
    }
  } else {
    alertGenericError("Download Error");
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
  if (maxPageTiles > 1) {
    pageCounterTiles.style.display = "inline";
  } else {
    pageCounterTiles.style.display = "none";
  }
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
function pickTile(id) {
  clearMap();

  var pickedTileButton = -1;
  if (this !== undefined) {
    pickedTileButton = parseInt(this.id.slice(-1), 10);
    pickedTile = pickedTileButton + (10 * pageTiles) - 10;
  } else {
    pickedTile = id;
    pickedTileButton = pickedTile - (10 * pageTiles) + 10;
  }
  for (var i = 0; i < tilesList.length; i++) {
    if (i == pickedTileButton || tilesList[i].innerHTML == "__") {
      tilesList[i].disabled = true;
    } else {
      tilesList[i].disabled = false;
    }
  }
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
            buttonDownload.innerHTML = "Bestellung wird bearbeitet (aktualisieren)";
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

  var mapTileCoordinates = "";
  for (var i = 0; i < mapTilesIDs[pickedTile][4].length; i++) {
    if (mapTileCoordinates === "") {
      mapTileCoordinates = mapTileCoordinates + mapTilesIDs[pickedTile][4][i];
    } else {
      mapTileCoordinates = mapTileCoordinates + "<br>" + mapTilesIDs[pickedTile][4][i];
    }
    mapTilesText = mapTilesText + "<br>" + mapTilesIDs[pickedTile][4][i];
    polygon.push([mapTilesIDs[pickedTile][4][i][1], mapTilesIDs[pickedTile][4][i][0]]);
  }
  tablePlatform.innerHTML =  mapTilesIDs[pickedTile][0];
  tableID.innerHTML = mapTilesIDs[pickedTile][1];
  tableStatus.innerHTML = mapTilesIDs[pickedTile][2];
  tableTime.innerHTML = mapTilesIDs[pickedTile][3];
  tableCoordinates.innerHTML = mapTileCoordinates;
  polygonOnMap = new L.polygon([latLongSwitch(polygon)], {fillOpacity: 0}).addTo(map);
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
  if (timespanInput.value >= 1 && timespanInput.value <= 30) {
    timespan = timespanInput.value;
    updateText2();
  } else {
    alertParameterError("Zeitspanne", 1, 30);
  }
}

/* setzt maxCloudCover nach Werten, die der Nutzer eingegeben hat */
function setmaxCloudCover() {
  if (maxCloudCoverInput.value >= 0 && maxCloudCoverInput.value <= 100) {
    maxCloudCover = maxCloudCoverInput.value;
    if (maxCloudCover == "") {
      maxCloudCover = 0;
    }
    updateText2();
  } else {
    alertParameterError("Maximale Wolkenbedeckung", 0, 100);
  }
}
/* UI Update */
function updateText2() {
  if (timespan == 1) {
    tableTimespan.innerHTML = timespan + " Tag";
  } else {
    tableTimespan.innerHTML = timespan + " Tage";
  }
  tableCloudCover.innerHTML = maxCloudCover + " %"
}

/* Zeigt Map Tiles an */
function showMapTile(uuid) {
  if (imageOverlayed === true) {
    map.removeLayer(imageOverlay);
  }
  var imageUrl = "https://localhost:3000/mapTiles/" + uuid + ".png";
  var errorOverlayUrl = 'https://cdn-icons-png.flaticon.com/512/110/110686.png';
  var altText = "test";
  var latLngBounds = L.latLngBounds(mapTilesIDs[pickedTile][4]);
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
