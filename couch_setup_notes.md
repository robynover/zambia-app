## Notes for setting up CouchDB on a local OSX machine

1. Run "ifconfig" in Terminal to find your local IP, eg, 192.168.1.2. Look for either "en0" or "en1", and under that entry look for "inet".

2. Confirm that it's the right IP address by putting the address into a browser on your handheld (assuming your computer and your handheld are on the same network). If it doesn't work, there are some additional steps you can try, described here: <http://stackoverflow.com/questions/11005540/localhost-running-on-mac-can-i-view-it-on-my-android-phone>

3. When #2 is working, start CouchDB. With the native OSX app, you can just start the Apache CouchDB application.   
<http://docs.couchdb.org/en/latest/install/mac.html#installation-using-the-apache-couchdb-native-application>   
Confirm that Couch is running by visiting localhost:5984/_utils in a browser. This is the GUI interface for CouchDB, called *Futon*.
	
4. Check the CouchDB configuration settings. In Futon, on the right sidbar, go to Tools > Configuration. Set the option "bind_address" (under "httpd") to "0.0.0.0" if it is not already set to that.

5. Use the IP address from step #2 in your **mobile** browser, but add the port number, eg., 192.168.1.3:5984. If it works, you'll see a short JSON string, like:

		{"couchdb":"Welcome","uuid":"cdb49f94bfded984f5c7c38c6fef4ce4","version":"1.5.0","vendor":{"version":"1.5.0-1","name":"Homebrew"}}

6. In the phonegap project, copy the folder **www/app_couch_setup** and put it on your local server -- MAMP or OSX's built-in server or whatever you are using. Open the PHP script **couch_setup.php** in a text editor and set the variable **$dbname** to whatever you like -- this will be the name of the new CouchDB database. Run the PHP script.    
Note that the script has 2 dependent JSON files in the *couch_views* folder. That folder is in the same directory as the PHP script.


### Troubleshooting
It is unlikely you will need to do this when running Android in a local environment, but if you have trouble syncing, you may need to set up CORS. More information about that is here: http://pouchdb.com/getting-started.html (Scroll to "CORS"). If you are running Couch locally, you may not need a username and password, so the curl commands are slightly different than in the article. Use:

	export HOST=127.0.0.1:5984
	curl -X PUT $HOST/_config/httpd/enable_cors -d '"true"'
	curl -X PUT $HOST/_config/cors/origins -d '"*"'
	curl -X PUT $HOST/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
	curl -X PUT $HOST/_config/cors/headers -d \ '"accept, authorization, content-type, origin"'

#### In the app
Now you'll need to set the local server address and database in the app. You can do this within the app itself, or hardcode it into the PhoneGap index.js file (or both, if you set it in the .js and then need to change it).

Two options:

1. *From the app itself:* Choose "Servers" in the slide-out menu, under the "Settings" section. Fill in the address, in the following format:

		http://IP_ADDRESS:5984/DATABASE_NAME, 
	for example:
	
		http://192.168.1.2:5984/zambia415 
	You can disregard the "Remote" settings for now.

2. *In PhoneGap Javascript files:* In the main index.js file of the PhoneGap project (www/js/index.js) find the "initData" function (line 21 as of this writing). The database is initialized with these lines: 

		dBase.init('somename',{
		   local: 'http://192.168.1.2:5984/zambia415',
		   remote: 'http://ec2-54-84-90-63.compute-1.amazonaws.com:5984/aname'
		});
Change the value for "local" to your IP and the name of the database you just created, eg,*http://192.168.1.2:5984/zambia415*. You can disregard "remote" for now.
