//####################################################################################################################################
//#######   VAR   ####################################################################################################################
//####################################################################################################################################


const urlDBTweet = "https://localhost:3000/tweet/";                                   //URL Datenbankverbindung Tweets
const urlDBLocations = "https://localhost:3000/locations/";                           //URL Datenbankverbindung Locations
const urlAPITweet = "https://localhost:3000/tweets/";                                 //URL API Anbindung Tweets
const urlAPILocation = "https://localhost:3000/geocoding/";                           //URL API Anbindung Locations
const urlAPICopernicusSearch = "https://localhost:3000/copernicusSearch/";            //URL API Anbindung copernicus Suche
const urlAPICopernicusMapTiles = "https://localhost:3000/copernicusMapTiles/";            //URL API Anbindung copernicus mapTiles

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
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

button1.addEventListener("click", setUserRadius, false);
map.on('click', onMapClick);

var circleSiwersk = new L.circle([48.866295694987045, 38.09141727142872], {radius: 5000, color: "red"});
map.addLayer(circleSiwersk);

//----------------------------------Twitter-------------------------------------------------------------
var urlTwitter = "https://api.twitter.com/1.1/search/tweets.json?q=&geocode="
var tweetsObj;
var tweetsDBObj;
var tweets = [];
var tweetsDB = [];
var tweetsList = [];
var prevButton = document.getElementById("prev");
var nextButton = document.getElementById("next");
var button2 = document.getElementById("button2");
var buttonSat = document.getElementById("buttonSat");
var buttonTranslate = document.getElementById("buttonTranslate");
var buttonTime = document.getElementById("buttonTime");
var buttonClouds = document.getElementById("buttonClouds");
var timespanInput = document.getElementById("input2");
var maxCloudCoverInput = document.getElementById("input3");
var text2 = document.getElementById("text2");
var text3 = document.getElementById("text3");
var text4 = document.getElementById("text4");
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
buttonTranslate.addEventListener("click", openTranslate, false);
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
var translateLink = "";
var timespan = 5;
var maxCloudCover = 50;
var copernicusIDs = [];
var pageTiles = 1;
var maxPageTiles = Math.ceil(copernicusIDs.length / 10);
var pageCounterTiles = document.getElementById("pageCounterTiles");
var currentTilePicked = -1;

//-------------------------------------------Geocoding--------------------------------------------------------
var locations = [];

//####################################################################################################################################
//#######   Map   ####################################################################################################################
//####################################################################################################################################

function updateText() {
  if (centerLat == -1000 || centerLong == -1000) {
     text1.innerHTML = "Klicken um Area of Interest mit Radius von " + radius + " km zu setzen!"
  } else {
    button2.disabled = false;
    text1.innerHTML = "Area of Interest ist " + radius + " km um Koordinate  " + centerLat + " / " + centerLong + " (Lat/Long)!";
  }
}

function onMapClick(e) {
  centerLat = e.latlng.lat;
  centerLong = e.latlng.lng;
  map.removeLayer(circle);
  circle = new L.circle(e.latlng, {radius : radius * 1000});
  map.addLayer(circle);
  updateText();
}

function setUserRadius() {
  if (radiusInput.value >= 1 && radiusInput.value < 501) {
    radius = Math.floor(radiusInput.value);
    circle.setRadius(radius * 1000);
    updateText();
  } else {
    alert("Radius muss zwischen 1 und 500 liegen!")
    //console.log(tweets);
  }

}

//####################################################################################################################################
//########   Twitter   ###############################################################################################################
//####################################################################################################################################

function previous() {
  page--;
  updatePageCounter();
  showTweets();
}
function next() {
  page++;
  updatePageCounter();
  showTweets();
}
function updatePageCounter() {
  pageCounter.innerHTML = page + " / " + maxPage;
  if (page <= 1) {
    prevButton.disabled = true;
  } else {
    prevButton.disabled = false;
  }
  if (page >= maxPage) {
    nextButton.disabled = true;
  } else {
    nextButton.disabled = false;
  }
}

async function getTweets() {
  tweetsDB = [];
  tweets = [];
  tweetsList = [];
  tweetsDBObj = await getTweetsDB();
  tweetsObj = await getTweetsAPI();
  //console.log(tweetsDBObj);
  //console.log(tweetsObj.statuses[0]);
  for (var i = 0; i < tweetsDBObj.length; i++) {
    if (getDistanceFromLatLonInKm(centerLat, centerLong, tweetsDBObj[i].lat, tweetsDBObj[i].long) < radius) {
      tweetsDB.push(tweetsDBObj[i].tweetObject);
    }
  }
  for (var i = 0; i < tweetsObj.statuses.length; i++) {
    var inDBList = false;
    for (var j = 0; j < tweetsDB.length; j++) {
      if (tweetsObj.statuses[i].id == tweetsDB[j].id) {
        inDBList = true;
      }
    }
    if (inDBList == false) {

      if (tweetsObj.statuses[i].geo != undefined) {
        console.log("add");
        addTweetsDB(tweetsObj.statuses[i], tweetsObj.statuses[i].geo.coordinates[0], tweetsObj.statuses[i].geo.coordinates[1]);
      } else {
        var locationObj = await getCoordinatesOfLocation(tweetsObj.statuses[i]);
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
      if (tweetsObj.statuses[i].user.location != "YAMA" && tweetsObj.statuses[i].user.location != "PRISTIN") {
        tweets.push(tweetsObj.statuses[i]);
      }
    }
  }
  //console.log(tweetsDB);
  //console.log(tweets);
  tweetsList = tweetsDB.concat(tweets);
  //console.log(tweetsList);
  maxPage = Math.ceil(tweetsList.length / 10);
  updatePageCounter();
  showTweets();
}

// GET TWEETS API --------------------------------------------------------------------------------------
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
//getSingleTweet("1532646733842460674");
//-------------------------------------------------------------------------------------------------------
//GET TWEETS DB
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

//Tweets anzeigen
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

function pickTweet() {
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
    var textEncoded = encodeURIComponent(tweetsList[selectedTweetNumber].text);
    translateLink = "https://translate.google.com/?hl=de&sl=auto&tl=en&text=" + textEncoded + "&op=translate";
    buttonTranslate.style.display = "block";
    buttonSat.disabled = false;
  } else {
    unPickTweet();
    currentTweetPicked = -1;
  }
}

function unPickTweet() {
  showTweetsOnMap();
  currentTweetPicked = -1;
  p10.innerHTML = "";
  translateLink = "";
  buttonTranslate.style.display = "none";
  buttonSat.disabled = true;
  for (var i = 0; i < tweetparas.length; i++) {
    tweetparas[i].style.backgroundColor = "inherit";
  }
}

function openTranslate() {
  if (translateLink != "") {
    window.open(translateLink, "_blank").focus();
  }
}

//####################################################################################################################################
//##########   Satellitenbilder   ####################################################################################################
//####################################################################################################################################
function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

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

async function getSatelliteImages() {
  var latCurrent = tweetsList[currentTweetPicked].geo.coordinates[0];
  var longCurrent = tweetsList[currentTweetPicked].geo.coordinates[1];
  var date = convertTime(tweetsList[currentTweetPicked].created_at);
  var copernicusSearchRes = await searchCopernicus(latCurrent, longCurrent, date[0], date[1], maxCloudCover / 10);
  console.log(copernicusSearchRes);
  for (var i = 0; i < copernicusSearchRes.feed.entry.length; i++) {
    copernicusIDs.push(copernicusSearchRes.feed.entry[i].id._text);
  }
  console.log(copernicusIDs);
  document.getElementById("answer").innerHTML = copernicusIDs;
  maxPageTiles = Math.ceil(copernicusIDs.length / 10);
  updatePageCounterTiles();
}

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

async function copernicusMapTiles(uuid) {
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
    }
}

function nextTiles() {
  pageTiles++;
  updatePageCounterTiles();
  linkTileButtons();
}
function prevTiles() {
  pageTiles--;
  updatePageCounterTiles();
  linkTileButtons();
}
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
function linkTileButtons() {
  for (var i = 0; i < tilesList.length; i++) {
    var currentPos = pageTiles * 10 + i -10;
    if (copernicusIDs[currentPos] != undefined) {
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
function pickTile() {
  //console.log(this.id);
  var pickedTileButton = parseInt(this.id.slice(-1), 10);
  //console.log(pickedTileButton);
  var pickedTile = pickedTileButton + (10 * pageTiles) - 10;
  //console.log(pickedTile);
  console.log(copernicusIDs[pickedTile]);
//copernicusMapTiles("dc52e819-40ba-4a7b-988c-e003adcd560a");
}

function setTimespan() {
  if (timespanInput.value >= 0 && timespanInput.value <= 30) {
    timespan = timespanInput.value;
    updateText2();
  } else {
    alert("Zeitspanne muss zwischen 0 und 30 liegen");
  }
}

function setmaxCloudCover() {
  if (maxCloudCoverInput.value >= 0 && maxCloudCoverInput.value <= 100) {
    maxCloudCover = maxCloudCoverInput.value;
    updateText2();
  } else {
    alert("Maximale Wolkenbedeckung muss zwischen 0 und 100 liegen");
  }
}

function updateText2() {
  text3.innerHTML = "Erstellungszeitpunkt " + timespan + " Tage vor/nach der Erstellung des Posts";
  text4.innerHTML = "Maximal " + maxCloudCover + " % Wolkenbedeckung";
}

//####################################################################################################################################
//####################################################################################################################################
//####################################################################################################################################
