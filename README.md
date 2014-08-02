#Ethoinformatics PhoneGap application for the Zambia project

##USING IT
On start-up, a dashboard screen shows you the most recent completed and in-progress Sightings and Observer Activities. From the dashboard, you can add a new sighting or observer activity or see the full list of records of either type. You can add a new record of that type by clicking the plus symbol in the top right corner of the list view. There is also a bottom navigation bar. Database and Bluetooth settings are available from the "Settings" button in the navigation bar.

##WHAT IT DOES
- Record and edit observer activities
- Add new types of activities. Once they are added, they will appear in the activity selection list. An initial list is built into the app.
- Record and edit sightings, with the ability to add multiple phenotype records to each sighting.
- Connect to a bluetooth GPS device.
- Record GPS data (NMEA sentences) with each Sighting or Observer Activity record.
- Save to a remote Couch database.
- Provide birds-eye view of recent records on a home page dashboard.

##WHAT IT DOESN'T DO
- Edit phenotypes within a record. [PRIORITY fix] 
- Delete records. [PRIORITY fix] 
- Add new phenotype categories. [PRIORITY fix] 
- Record census information within a sighting (though it could be added in the notes section as a stop-gap measure) 
- Track GPS coordinates at a set interval. It captures GPS data at the time a new record is added. Because of the volume of NMEA database records in the GeoBluetooth test app, I wanted to prioritize the Sighting and Activity records. Consistent tracking is still an option, but in the first release it is omitted as a possible complicating factor. (TLDR; Let's make sure this app works before we start saving thousands of GPS records.)

##KNOWN ISSUES
- Inconsistent slow load times for lists of records.
- Hitting the Update button is often required in places where it  should auto-save instead (for example, changing a start or end time). For good measure, when you change something, hit "Update".

## WHAT WE'D LIKE TO KNOW
- How easy/hard is it to switch between tasks? For example, if you are taking notes in an activity, can you quickly get back to a sighting you were working on?
- Is the time-keeping functionality accurate? Does it give you enough information? Should you be able to edit the date and not just the time (on a practical level more than hypothetically)? 
- Are the records stored to CouchDB accurate? Meaningful? Does viewing the Couch interface in the browser give you a sense of the data you've collected that day? A good sense?
- How is bluetooth working? Are you experiencing connection problems? Is geodata stored with the records when you are connected to bluetooth (visible on Couch)?
- Battery life. Can the Android/iOS and GPS devices make it through the day?
 

##To set up a PhoneGap project using these files:

If you have not yet installed PhoneGap, see <http://ethoinformatics.org/internal/2014/02/05/phonegap-notes/>

1. From the command line, navigate to the folder where you'd like the PhoneGap project to reside and run: 

		cordova create zambia org.ethoinformatics.zambia ZambiaApp
-You can name things anything you like. Here the folder will be called "zambia" and the name of the project will be "ZambiaApp"-	


2. In the files you downloaded or cloned, take the www folder and copy it over to replace the www folder in your newly created phonegap project. 

3. On the command line, navigate into the zambia folder and run:

		cordova platform add android

4. In the command line:

		cordova run android