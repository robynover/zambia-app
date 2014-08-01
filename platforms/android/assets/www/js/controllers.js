// ==== CONTROLLERS ==== //
angular.module('zapp.controllers', [])

.controller('MainController',function (
		$scope,
		$ionicSideMenuDelegate,
		$filter,
		$state,
		observerActivityFactory,
		sightingFactory,
		$rootScope){
	
	$scope.toggleSideMenu = function() {
	    $ionicSideMenuDelegate.toggleRight();
	};
	var d = new Date().getTime();
	$scope.date_today = $filter('date')(d, 'MMMM d, yyyy');
	//$scope.time_now = $filter('date')(d, 'HH:mm');
	$scope.goBack = function() {
	  window.history.back();
	};
	// dashboard
	$scope.sightingsInProgress = {};
	$scope.sightingsCompleted = {};
	$scope.activitiesInProgress = {};
	$scope.activitiesCompleted = {};
	observerActivityFactory.getObserverActivityRecords("inprogress",3).then(function(results){		
		$scope.activitiesInProgress.docs = results.rows;
		//console.log(results.rows);
	});
	observerActivityFactory.getObserverActivityRecords("completed",3).then(function(results){		
		$scope.activitiesCompleted.docs = results.rows;
	});
	sightingFactory.getSightings("inprogress",3).then(function(results){
		$scope.sightingsInProgress.docs = results.rows;
		
	});
	sightingFactory.getSightings("completed",3).then(function(results){
		$scope.sightingsCompleted.docs = results.rows;
	});

})
.controller('BluetoothController',function($scope,bluetoothFactory,nmeaFactory){
	$scope.greeting = "hello"; //control var

	$scope.nmeaPacket = [];
	$scope.firstSentenceType = false;
	$scope.lastCompletePacket = [];
	$scope.lastSaveTime = new Date().getTime();

	//see if it's already on.
	bluetoothSerial.isConnected(
			function(){
				console.log('bluetooth is ON!');
			},
			function(){
				console.log('bluetooth is OFF');
			}
	);

	$scope.$on('bt-connected',function(){
		$scope.$apply(function(){
			$scope.btConnectionStatus = 'Connected to '+ $scope.currentDevice.name;
			//$rootScope.bluetoothConnected = true;
			//$scope.bluetoothConnected = true;
		});
	});
	$scope.$on('bt-connection-fail',function(){
		$scope.$apply(function(){
			$scope.btConnectionStatus = 'Could not connect';
			//$rootScope.bluetoothConnected = false;
			//$scope.bluetoothConnected = false;
		});	
	});
	$scope.$on('bt-disconnected',function(){
		$scope.$apply(function(){
			$scope.btConnectionStatus = 'Disconnected from ' + $scope.currentDevice.name;
			//$rootScope.bluetoothConnected = false;
			//$scope.bluetoothConnected = false;
		});	
	});

	$scope.getDeviceList = function(){
		bluetoothFactory.findDevices(function(results) {
			console.log('got device list');
			// put in $apply to update the view async'ly
			$scope.$apply(function(){
				$scope.deviceList = results;
				$scope.currentDevice = results[0];
			});
		});
	};	

	$scope.connectToBt = function(){
		$scope.btConnectionStatus = 'Connecting ...';
		//console.log('connect to bt. device: ' + $scope.currentDevice.address + ' id: '+$scope.currentDevice.id);
		//console.log(JSON.stringify($scope.currentDevice));
		//bluetoothFactory.connect($scope.currentDevice.id); // factory(ies) takes care of all data processing
		bluetoothFactory.connectionManager().connect($scope.currentDevice.id);




		/*bluetoothFactory.connect($scope.currentDevice.id, function(data){
			//Manage NMEA packets. The parsing is done by the factory. grouping of sentences is done here
			var sentenceType = data.split(',')[0]; // eg, $GPXYZ
			
			// use the first sentence we see as the base, to know when it's made a round, and to make a new packet
			if (!$scope.firstSentenceType){
				$scope.firstSentenceType = sentenceType;
			}
			// if it has made its full round of sentences, it's a packet
			if ($scope.firstSentenceType == sentenceType && $scope.nmeaPacket.length > 0){
				// store this completed packet before clearing it
				// can't store objects in local storage, so have to stringify (argh!)
				//localStorage.setItem('currentNmeaPacket',JSON.stringify($scope.nmeaPacket));
				// only store if it the interval has passed
				if(new Date().getTime() > ( $scope.lastSaveTime + (30 * 1000) ) ){
					localStorage.setItem('currentNmeaPacket',JSON.stringify($scope.nmeaPacket));
					
					$scope.lastSaveTime = new Date().getTime();
					console.log("STORED");
				}
				//clear out the packet whether you store it or not
				$scope.nmeaPacket = [];
				 
			}
			// add data to the packet
			$scope.nmeaPacket.push(data);

		});*/ 
		/*
		//alt way, using registry
		bluetoothFactory.connect(device); //initiates the conn to bt if it's not already connected
		var myNmeaProcess = function(nmeaSentence){
			myArr.push(nmeaSentence) // array has to exist somewhere where it doesn't get overwritten each func cal
			// maybe define myArr as $scope.myArr ?
			// keep going till you've got the packet, then:
			//bluetoothFactory.removeSubscriber(btSubscriberId);
			// scope is gonna be an issue here! maybe need promises?
			// ... hmm ACTUALLY! maybe code from above would work as is, using $scope (cld make anon func instead if needed)
			
			var sentenceType = data.split(',')[0];
			if (!$scope.firstSentenceType){
				$scope.firstSentenceType = sentenceType;
			}
			// once the first sentence comes around again, unsubscribe.
			if ($scope.firstSentenceType == sentenceType && $scope.nmeaPacket.length > 0){
				bluetoothFactory.removeSubscriber(btSubscriberId);
			}
			// add sentence
			$scope.nmeaPacket.push(data);
		};
		var btSubscriberId = bluetoothFactory.registerSubscriber(myNmeaProcess);
	
		*/
	};
   
})
.controller('SettingsController',function($scope,pouchDbFactory,$timeout,$rootScope){
	// set scope vars to local storage vars
	$scope.remoteServer = localStorage.getItem('remoteServer');
	$scope.remoteDbName = localStorage.getItem('remoteDbName');
	$scope.db = true; //show db pane to start

	$scope.saveDbSettings = function(){
		//console.log("saveDbSettings called");
		var settingsObj = pouchDbFactory.setRemoteServer($scope.remoteServer,$scope.remoteDbName);
		// if results came back (ip may have been format corrected)
		if (settingsObj.ip != $scope.remoteServer){
			$scope.remoteServer = settingsObj.ip;
		}
		if (settingsObj.db != $scope.remoteDbName){
			$scope.remoteDbName = settingsObj.db;
		}
		$scope.statusUpdated = true; // css animation.sets bg color in template. 
		$timeout(function() {
            $scope.statusUpdated = false;
          }, 3000);
		$scope.status_msg = "Updated Database Settings.";
	};

	// options to replicate to remote couchdb live here too
	$scope.saveToCouch = function(){	
		$scope.isLoading = true;
		var myfunc = function(val){
			//console.log('test');
			
		};
		pouchDbFactory.saveToRemote($scope.remoteServer,$scope.remoteDbName)
		.on('complete',function(result){
			
			console.log('complete');
			$rootScope.$apply(function(){
				$scope.isLoading = false;
				$scope.status_msg = "Succesfully saved to remote database.";
			});
		})
		.on('error',function(err){
			console.log('error');
			$rootScope.$apply(function(){
				$scope.isLoading = false;
				$scope.status_msg = "There was an error saving to remote database. See below for details.";
				$scope.dbErrorMsg = 'There was an error connecting to the database ';
				$scope.dbErrorMsg += $scope.remoteDbName;
				$scope.dbErrorMsg += ' on server ' + $scope.remoteServer;
				$scope.dbErrorMsg += ' Database response: ' + err.toString();
			});
		});
	};	


})
.controller('ActivityController', function ($scope,observerActivityFactory) {
    $scope.activities = observerActivityFactory.getAllActivities();
})
.controller('ObserverActivityCollectionController', function ($rootScope,$scope,observerActivityFactory,$stateParams) {
	$scope.base_url = 'observer_activity';
	$rootScope.path_to_new = 'observer_activity/';
	$scope.list_url = 'activity_records';
	$scope.title = "Observer Activity Records";
	$scope.filterBy = 'all';

	switch ($stateParams.getby){ //setting explicitly to restrict values allowed
		case "completed":
			$scope.filterBy = 'completed';
			break;
		case "inprogress":
			$scope.filterBy = 'inprogress';
			break;
	}
	observerActivityFactory.getObserverActivityRecords($scope.filterBy).then(function(results){		
		$scope.docs = results.rows;
		//console.log(results.rows);
	});
   
})
.controller('ObserverActivityController', function (
		$scope,
		$stateParams,
		$filter,
		observerActivityFactory,
		$interval,
		$state,
		$rootScope,
		//$timer,
		myTimeService,
		nmeaFactory) {
	$scope.observerActivity = {record_type: 'observer_activity'};
	$scope.submitted = true; // assume at first it's not a new record
	$scope.title = "Observer Activity Record";
	var clockIsRunning = false;

	if ($stateParams.oaid){
		$scope.submitted = true; //show details only, not start button
		if (clockIsRunning){
    		stopClock();
    		$scope.observerActivity.elapsed_time = false;
    	}
		//get details
		observerActivityFactory.findById($stateParams.oaid)
		.then(function(results){
			//console.log(results);
			$scope.observerActivity = results;

			$scope.startTimeDisplay = $filter('date')($scope.observerActivity.start_time, 'HH:mm');
			
			if (!$scope.observerActivity.hasOwnProperty('end_time')) {
				startClock();	
			}
			
		});
		
	} else { // if it's new
		$scope.submitted = false; // if it is a new record
		//$scope.observerActivity = {record_type: 'observer_activity'};
		$scope.activities = observerActivityFactory.getAllActivities();
		$scope.observerActivity.activity_name = $scope.activities[0];
		//$scope.submitted = false; // if it's a new record
	}
	
    // listen for elapsed time update
	$scope.$on('ets-timer', function(event,data) {
		// update elapsed time 	var
     	$scope.observerActivity.elapsed_time = data;
     	//console.log('running');
   	});
	
	/* IMPORTANT! make sure the clock has stop when they leave the page
   	   if it hasn't, it causes both times to flash back and forth next time you go to a detail page */
   	$scope.$on('$locationChangeStart', function(event) {
   		console.log('locationChangeStart clock: ' + clockIsRunning);
	    //clockIsRunning = false;
	    $scope.observerActivity.elapsed_time = false;
	    stopClock();
	});
	
	$scope.createObsActivity = function(){
		console.log('createObsActivity called');
		$scope.submitted = true;
		// stores to Pouch, and Pouch returns record w/ id and rev
		$scope.observerActivity.start_time = new Date().getTime();

		// ---- HANDLE NEW ACTIVITY NAME ------ //
		if ($scope.observerActivity.activity_name == 'new'){
			// add the new activity to the list and select it
			$scope.activities.push(new_activity_field.value);
			//$scope.observerActivity.activity_name = $scope.activities[$scope.activities.length - 1];
			$scope.observerActivity.activity_name = new_activity_field.value;
			// TODO: add it to the master list of activities (from local storage ?)
		} 

		var addRecord = function(){
			observerActivityFactory.add($scope.observerActivity).then(
				function(res){
					console.log('record added!');
					$scope.observerActivity._id = res.id;
					$scope.observerActivity._rev = res.rev;
					//check
					console.log(JSON.stringify($scope.observerActivity));
					// now that there's a start time, start the clock
					startClock();
					// show status message
					$scope.status_msg = $scope.observerActivity.activity_name + ", started at "; 
					$scope.status_msg += $filter('date')($scope.observerActivity.start_time, 'HH:mm:ss');
					//handleAlert();

				}
			);
		};

		// ****** !!! add location data !!! ********** //
		// wait for geo data if BT is on
		//if ($rootScope.bluetoothConnected){
		bluetoothSerial.isConnected(
			function(){ //yes
				console.log('observerActivity knows BT is connected');
				nmeaFactory.getNmeaPacket().then(function(nmeaData){
					$scope.observerActivity.geolocation = nmeaData;
					addRecord();
				},function(){ 
					console.log('bluetooth timed out');
					// no data came in, go ahead and add record anyway
					console.log(JSON.stringify($scope.observerActivity));
					addRecord();
				});
			},
			function(){ //no
				console.log('no BT');
				console.log(JSON.stringify($scope.observerActivity));
				addRecord();
			}
			);


		/*if (bluetoothSerial.isConnected === true){
			console.log('observerActivity knows BT is connected');
			nmeaFactory.getNmeaPacket().then(function(nmeaData){
				$scope.observerActivity.geolocation = nmeaData;
				addRecord();
			},function(){ 
				console.log('failed w timeout');
				// no data came in, go ahead and add record anyway
				console.log($scope.observerActivity);
				addRecord();

			});
			// ? time out -- in case bluetooth doesn't give data, don't stall the whole process

		} else {
			console.log('no BT');
			console.log(JSON.stringify($scope.observerActivity));
			addRecord();
		}*/
		
		
		// observerActivityFactory is using add() function inherited from pouchDbFactory
		/*observerActivityFactory.add($scope.observerActivity).then(
			function(res){
				//console.log(res);
				$scope.observerActivity._id = res.id;
				$scope.observerActivity._rev = res.rev;
				// now that there's a start time, start the clock
				startClock();
				// show status message
				$scope.status_msg = $scope.observerActivity.activity_name + ", started at "; 
				$scope.status_msg += $filter('date')($scope.observerActivity.start_time, 'HH:mm:ss');
				//handleAlert();

			}
		);*/		
	};
	// NEEDS WORK: bc of time formats, form fields and props won't auto update.
	$scope.editObsActivity = function(){
		observerActivityFactory.update($scope.observerActivity).then(
			function(res){
				if (res.ok === true){
					// update revision number
					$scope.observerActivity._rev = res.rev;
					// show success message
					$scope.status_msg = "Updated Record.";
				} else {
					$scope.status_msg = "Could not update record.";
				}
				//handleAlert();
			}
		);
	};

	$scope.endObsActivity = function(){
		// to end, just add the end time and edit the record
		$scope.observerActivity.end_time = new Date().getTime();
		$scope.editObsActivity();
		stopClock();		
	};

	// in the <input> element, the date info gets stripped. this puts it back based on the last start_time
	$scope.fixTime = function(e,startOrEnd){
		
		// really? is this the only way to get the value of an element from event? 
		var inputVal = angular.element(e.target)[0].value;
		var startDate = new Date($scope.observerActivity.start_time);
		var formattedStart = $filter('date')(startDate, 'MM-dd-yyyy');
		var correctedTimeStamp = new Date(formattedStart + ' ' + inputVal).getTime(); 
		// set the new start time (or end time) manually
		
		// is this start or end time?
		/* could also get element id but that relies on it being there
		 console.log(angular.element(e.target)[0].id); */
		if (startOrEnd == 'start'){
			$scope.observerActivity.start_time = correctedTimeStamp;
		} else if (startOrEnd == 'end') { // should we default to one or the other or be explicit?
			$scope.observerActivity.end_time = correctedTimeStamp;
		}
		console.log(correctedTimeStamp);
		
		// <input> comes back without the seconds and ms values.
		// if you want to correct for seconds/ milliseconds -- something like:
		// 
		/*var orig_ms = startDate.getSeconds() * 1000;
		//  new secs will always be 00
		var addOrSub = (correctedTimeStamp > startDate.getTime()) ? (-1) : (1); 
		correctedTimeStamp =  correctedTimeStamp + ( (orig_ms * addOrSub));
		console.log("    orig:" + startDate.getTime() + "     corrected: " + correctedTimeStamp );
		console.log('orig ' +  $filter('date')(startDate, 'MM-dd-yyyy HH:mm:ss'));
		console.log('corrected: ' + $filter('date')(new Date(correctedTimeStamp), 'MM-dd-yyyy HH:mm:ss'));*/
		
		// alternately, use datetime type to keep the date info with the input
		// another option: separate input for time and date (unlikely that you'll need to change date, but possible)
	};
	//private funcs to start/end elapsed time timer
	var startClock = function(){
		this.clockIsRunning = true;
		this.intervalId = $interval(function() {
			myTimeService.updateElapsedTime($scope.observerActivity.start_time,true);					
			}, 1 * 1000);	
	};
	var stopClock = function(){
		// clear the interval
		if (this.clockIsRunning === true){
			$interval.cancel( this.intervalId );
			this.clockIsRunning = false;
		}	
	};
	// again, util function that should prob go in a service or something -- scoping issue
	// var handleAlert = function () {
	// 	$scope.statusUpdated = true; // css animation.sets bg color in template. 
	// 	$timeout(function() {
 //            $scope.statusUpdated = false;
 //          }, 3000);
	// };
})
/* --- SIGHTING CONTROLLER --- */
.controller('SightingController', function (
		$scope, 
		$stateParams,
		sightingFactory,
		$filter,
		$interval,
		myTimeService,
		$ionicModal,
		$timeout) {
    $scope.sighting = {record_type: 'sighting'};
    $scope.title = 'Sighting';
    $scope.allPhenotypes = sightingFactory.getAllPhenotypes();
    //console.log(sightingFactory.getAllPhenotypes());
    // fudge for getting a static "new" option in auto-generated ng-options, which you have to use if you want to bind to an object
    //$scope.allPhenotypes.push({id:'new',name:'New Phenotype'});
    $scope.sighting.phenotypes = []; //array of phenotypes related to this sighting
    var clockIsRunning = false;
    if ($stateParams.sid){ //existing record
    	// stop the timer if there is one running
    	console.log('back on page '+ $scope.sighting.elapsed_time);
    	if (clockIsRunning){
    		stopClock();
    		$scope.sighting.elapsed_time = false;
    	}
    	console.log('elapsed time cleared: '+ $scope.sighting.elapsed_time);
    	$scope.submitted = true; //show details only, not start button
    	sightingFactory.findById($stateParams.sid)
		 .then(function(results){
			$scope.sighting = results;
			/*$scope.sighting.phenotypes = [ //test data
    			{id:90, name:'big beak'},
				{id:44, name:'gray nose'}];*/
			if (!$scope.sighting.hasOwnProperty('end_time')) {
				startClock();
			}		
		}); 
    } else { // new sighting
    	$scope.submitted = false; 
    	$scope.sighting = {record_type: 'sighting'};
    }
    $scope.setTempPhenotype = function(val){
    	console.log(val);
    	if (!$scope.tempPhenotype){
    		$scope.tempPhenotype = {frequency:50};
    	}
    	$scope.tempPhenotype.name = val;
    	$scope.closeModal();
    	//open the phenotype detail box
		$scope.showPhenoDetail = true;
    };
	$scope.addPhenotype = function(phenoObj){ //add to this sighting
		// TODO: remove phenotype choice from dropdown list
		//if it's new, add it to the list of all
		if (phenoObj.id == 'new'){
			// ???? // phenoObj.id = $scope.allPhenotypes.length; // the ids start at 1,not zero
		}
		if (!$scope.sighting.phenotypes){
			$scope.sighting.phenotypes = [];
		}
		$scope.sighting.phenotypes.push(phenoObj);
		$scope.status_msg = "Phenotype added: " + phenoObj.name;
		handleAlert();
		// clear out the temporary phenotype object
		$scope.tempPhenotype = {};
		
		//close the phenotype detail box
		$scope.showPhenoDetail = false;

	};
    $scope.createSighting = function(){
		$scope.submitted = true;
		$scope.start_button = "End Sighting";
		$scope.sighting.start_time = new Date().getTime();

		sightingFactory.add($scope.sighting).then(
			function(res){
				//console.log(res);
				$scope.sighting._id = res.id;
				$scope.sighting._rev = res.rev;
				startClock();
				// show status message
				$scope.status_msg = "New sighting started at ";
				$scope.status_msg += $filter('date')($scope.sighting.start_time, 'HH:mm:ss');
				handleAlert();
			}
		);		
	};
	$scope.editSighting = function(){
		sightingFactory.update($scope.sighting).then(
			function(res){
				if (res.ok === true){
					// update revision number
					$scope.sighting._rev = res.rev;
					// show success message
					$scope.status_msg = "Updated Record.";
				} else {
					$scope.status_msg = "Could not update record.";
				}
				handleAlert();
			}
		);
	};
	$scope.endSighting = function(){
		// to end, just add the end time and edit the record
		$scope.sighting.end_time = new Date().getTime();
		stopClock();
		$scope.editSighting();
	};

	// listen for elapsed time update
	$scope.$on('ets-timer', function(event,data) {
		// update elapsed time 	var
     	$scope.sighting.elapsed_time = data;
     	//console.log('running');
   	});
   	/* IMPORTANT! make sure the clock has stop when they leave the page
   	   if it hasn't, it causes both times to flash back and forth next time you go to a detail page */
   	$scope.$on('$locationChangeStart', function(event) {
   		console.log('locationChangeStart clock: ' + clockIsRunning);
	    //clockIsRunning = false;
	    $scope.sighting.elapsed_time = false;
	    stopClock();
	});
	
	//private funcs to start/end elapsed time timer
	var startClock = function(){
		console.log('Clock STARTED for: '+ $scope.sighting.start_time);
		this.clockIsRunning = true;	
		this.intervalId = $interval(function() {
			myTimeService.updateElapsedTime($scope.sighting.start_time,true);					
		}, 1 * 1000);
		
	};
	var stopClock = function(){
		console.log('Clock ENDED for: '+ $scope.sighting.start_time);
		// clear the interval
		if (this.clockIsRunning === true){
			$interval.cancel( this.intervalId );
			this.clockIsRunning = false;
		}			
	};
	// again, util function that should prob go in a service or something -- scoping issue
	var handleAlert = function () {
		$scope.statusUpdated = true; // css animation.sets bg color in template. 
		$timeout(function() {
            $scope.statusUpdated = false;
          }, 3000);
	};
	// util func needs to be moved elsewhere (see elapsedTimeService)
    /*var startClock = function(){
		if ($scope.sighting.start_time && !$scope.sighting.end_time){
			var intervalId = $interval(function() {
				$scope.sighting.elapsed_time = elapsedTimeService.getStr($scope.sighting.start_time);
			}, 1 * 1000);
		} else {
			$interval.cancel( intervalId );
		}
	};*/

	/** --- MODAL ---- **/
	$ionicModal.fromTemplateUrl('templates/multi_select.html', function($ionicModal) {
	        $scope.modal = $ionicModal;
	    }, {
	        scope: $scope,
	        animation: 'slide-in-up'
	    }).then(function(modal) {
    		$scope.modal = modal;
    		
  		});
  		
  		$scope.openModal = function() {
			$scope.modal.show();
			//$scope.phenotypeSelected = false;
			
		};
		$scope.closeModal = function() {
			$scope.modal.hide();
			//$scope.phenotypeSelected = true;
		};

	/** --- /end MODAL ---- **/
})

/* --- SIGHTING COLLECTION CONTROLLER --- */
.controller('SightingCollectionController', function ($rootScope,$scope,$stateParams,sightingFactory,$location) {
	$scope.base_url = 'sighting'; // base url of individual records
	$rootScope.path_to_new = 'sighting/';
	$scope.title = "Sightings";
	$scope.list_url = 'sightings';
	//console.log($location.url());
	$scope.filterBy = 'all';

	switch ($stateParams.getby){ //setting explicitly to restrict values allowed
		case "completed":
			$scope.filterBy = 'completed';
			break;
		case "inprogress":
			$scope.filterBy = 'inprogress';
			break;
	}

	sightingFactory.getSightings($scope.filterBy,false).then(function(results){
		//console.log(results);	
		$scope.docs = results.rows;
	});
})
.controller('geoController',function(){

});
