#Ethoinformatics PhoneGap application for the Zambia project

If you have not yet installed PhoneGap, see <http://ethoinformatics.org/internal/2014/02/05/phonegap-notes/> 

##To set up a PhoneGap project using these files:

1. From the command line, navigate to the folder where you'd like the phonegap project to reside and run: 

		cordova create zambia org.ethoinformatics.zambia ZambiaApp
*You can name things anything you like. Here the folder will be called "zambia" and the name of the project will be "ZambiaApp"*	


2. In the files you downloaded or cloned, take the www folder and copy it over to replace the www folder in your newly created phonegap project. 

3. On the command line, navigate into the zambia folder and run:

		cordova platform add android

4. There will now be a folder called "android" in the "platforms" folder in the app. Open the XML file *zambia/platforms/android AndroidManifest.xml*, and add these 3 lines of XML inside the root <manifest> tag:

		<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
		<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
		<uses-permission android:name="android.permission.ACCESS_LOCATION_EXTRA_COMMANDS" />
	That turns on geolocation ability in the app. More info here if you need it: <http://docs.phonegap.com/en/2.4.0/cordova_geolocation_geolocation.md.html>

5. In the command line:

		cordova run android