# GeoDataFusion



#Installation

* MongoDB
  * [herunterladen](https://www.mongodb.com/try/download)
  * installieren (2 Möglichkeiten für Windows)
    * (1) als Windows Service (läuft automatisch im Hintergrund)
      * kann mit `net start MongoDB` gestartet werden
      * kann mit `net stop MongoDB` gestoppt werden
    * (2) alternativ (muss jedes mal manuell gestartet werden)
      * `C:\data` erstellen, wenn nicht vorhanden
      * In Eingabeaufforderung zum Speicherort der mongod.exe navigieren
      * `mongod --dbpath=/data`
  * Für andere Systeme [Dokumentation](https://docs.mongodb.com/manual/installation/) befolgen

---

* node.js
  * `npm install`
  * `npm start`
  * https://localhost:3000/# öffnen
  
---

* Benötigte APIs
  * Twitter API
    * "appKey", "appSecret", "accessToken", "accessSecret" in twitterClient.js setzen 
  * LocationIQ
    * "APIKEY" in .env setzen
  * Copernicus API
    * "USERNAME", "PASSWORD" in .env setzen
  * Planet API
    * "APIKEY" in .env setzen 
    
---

* Beispiel Tweets
  * Können per ID hinzugefügt werden
  * 1578651806061690881
  * 1575293997236486144
