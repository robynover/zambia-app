## Notes for CouchDB set-up on local OSX to work with a mobile device

1. Run "ifconfig" in Terminal to find your local IP, eg, 192.168.1.2. Look for either "en0" or "en1", and under that entry look for "inet".

2. Try putting that IP address into the browser on your device (assuming your computer and your tablet are on the same network). If it doesn't work, there are some additional steps you can try, described here: http://stackoverflow.com/questions/11005540/localhost-running-on-mac-can-i-view-it-on-my-android-phone

3. When #2 is working, start CouchDB. With the native OSX app, you can just start the Apache CouchDB application. http://docs.couchdb.org/en/latest/install/mac.html#installation-using-the-apache-couchdb-native-application 
	
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

6. On your Mac, go to Futon (the GUI interface for CouchDB) at localhost:5984/_utils and create a new database. Name it whatever you like. In the testing phases, I've been naming with a number to indicate a version, using the date, eg, "zambia415" on April 15, but use any convention you like. 

7. If you have trouble syncing, you may need to set up CORS. More information about that is here: http://pouchdb.com/getting-started.html (Scroll to "CORS"). If you are running Couch locally, you may not need a username and password, so the curl commands are slightly different. Use:
	export HOST=127.0.0.1:5984
	curl -X PUT $HOST/_config/httpd/enable_cors -d '"true"'
	curl -X PUT $HOST/_config/cors/origins -d '"*"'
	curl -X PUT $HOST/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
	curl -X PUT $HOST/_config/cors/headers -d \ '"accept, authorization, content-type, origin"'

#### In the PhoneGap files
In the main index.js file of the PhoneGap project (www/js/index.js) find the "initData" function (line 21 as of this writing). The database is initialized with these lines:

	dBase.init('somename',{
		local: 'http://192.168.1.2:5984/zambia415',
		remote: 'http://ec2-54-84-90-63.compute-1.amazonaws.com:5984/aname'
	});
	
Change the value for "local" to your IP and the name of the database you just created.

Find the syncDebug function near the end of the index.js file (ln 753 currently) -- it will look something like this: 

	syncDebug: function(){
		//dBase.couchSync(dBase.TO_REMOTE);
		dBase.couchSync(dBase.TO_LOCAL);
	}

Make sure the "TO REMOTE" line is commented and "TO LOCAL" is not. 
