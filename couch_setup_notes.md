## Notes for CouchDB set-up on local OSX to work with a mobile device

1. Run "ifconfig" in Terminal to find your local IP, eg, 192.168.1.2 

2. Try putting that IP address into the browser on your device (assuming your computer and your tablet are on the same network).

3. When #2 is working, start CouchDB. With the native OSX app, you can just start the Apache CouchDB application.
	Ref:http://docs.couchdb.org/en/latest/install/mac.html#installation-using-the-apache-couchdb-native-application 
	Confirm that Couch is running by visiting localhost:5984/_utils on your Mac.
	
4. Now try the same address from step #2 in your mobile browser, but add the port number, eg., 192.168.1.3:5984. If it works, you'll see a short JSON string, like:
{"couchdb":"Welcome","uuid":"cdb49f94bfded984f5c7c38c6fef4ce4","version":"1.5.0","vendor":{"version":"1.5.0-1","name":"Homebrew"}}

5. If #4 does not work, you may need to change your CouchDB configuration settings. You can find where the config files are stored by typing "couchdb -c" in the Terminal. You should see something like this: 
/usr/local/etc/couchdb/default.ini
/usr/local/etc/couchdb/local.ini
Open the last one in the list (usually called "local.ini") in a text editor and find the line that starts "bind address". Semi-colons are comments in this doc, so if that line starts with a semi-colon, remove the semi-colon. Change the line to read: "bind_address = 0.0.0.0" This will allow you to connect with this installation of Couch from any IP address. 
For reference, here is documentation on CouchDB config: 
	* http://docs.couchdb.org/en/latest/config/intro.html 
	* http://docs.couchdb.org/en/latest/config/http.html


