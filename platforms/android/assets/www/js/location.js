var geoLoc = {
	msg: '', 
	getLocation: function() {
          alert("getLocation");
          var locOptions = {
            timeout : 5000,
            enableHighAccuracy : true
          };
          //geoLoc.lc.innerHTML = JSON.stringify(geolocation);
          //get the current location
          navigator.geolocation.getCurrentPosition(geoLoc.onLocationSuccess, geoLoc.onLocationError, locOptions);
          //Clear the current location while we wait for a reading
          geoLoc.msg = "Reading location...";
      },

    onLocationSuccess: function(loc) {
        alert("onLocationSuccess");
        //We received something from the API, so first get the
        // timestamp in a date object so we can work with it
        var d = new Date(loc.timestamp);
        //Then replace the page's content with the current
        // location retrieved from the API
        geoLoc.msg = '<b>Current Location</b><hr /><b>Latitude</b>: ' 
                        + loc.coords.latitude + '<br /><b>Longitude</b>: ' 
                        + loc.coords.longitude + '<br /><b>Altitude</b>: ' 
                        + loc.coords.altitude + '<br /><b>Accuracy</b>: ' 
                        + loc.coords.accuracy + '<br /><b>Altitude Accuracy</b>: ' 
                        + loc.coords.altitudeAccuracy + '<br /><b>Heading</b>: ' 
                        + loc.coords.heading + '<br /><b>Speed</b>: ' 
                        + loc.coords.speed + '<br /><b>Timestamp</b>: ' 
                        + d.toLocaleString();
    },

    onLocationError: function(e) {
        alert("Geolocation error: #" + e.code + "\n" + e.message);
        geoLoc.msg = JSON.stringify(e);
    }	
};
/*
NOTE
phonegap geolocation listener looks like:
var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { frequency: 3000 });

see: http://docs.phonegap.com/en/1.4.1/phonegap_geolocation_geolocation.md.html#geolocation.watchPosition
*/
