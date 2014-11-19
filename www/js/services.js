// ==== SERVICES / FACTORIES ==== //
angular.module('zapp.services', [])
// Pouch "singleton" (kinda) -- so you don't have to call create() over and over
// there should be a way to parametize the db name ..! ?
// also THIS is probably where remote server info should be stored, not just in ls
.factory('pouchInstance', function (pouchdb) {
	return pouchdb.create('devicedb0801');
})
// Util functions for pouch
.factory('pouchDbFactory', function (pouchInstance,$q) {
	return {
		db: pouchInstance,
		
		all: function(){
			// using pouch promise
			return this.db.allDocs({include_docs: true});
		},
		add: function(record){
			//console.log('called from pouch');
			//console.log(JSON.stringify(record));
			if (record instanceof Array){
				return this.db.bulkDocs(record);
			} else {
				return this.db.post(record);
			}
		},
		update: function(record){
			return this.db.put(record);
		},
		findById: function(id){
			return this.db.get(id);
		},
		numDocs: function(){
			// returns a promise so .then() can be used in return val
			var deferred = $q.defer();
			this.db.allDocs({}).then(function(response) {
		        //console.log('f num ' + response.total_rows);
		        deferred.resolve(response.total_rows);
		    });
		    return deferred.promise;
		},
		
		/* 
		Add a text attachment to an exisiting doc, or create a new doc
		@doc 	 	object w the id and rev # of doc to attach to OR false to create a new doc
		@dataArr 	array of strings that will compose the text file
		@fieldName 	name of the property in the db doc that contains the attachment
		*/
		attachTxtFile: function(doc,dataArr,fieldName){
			// function to execute the attachment
			var attach = function(obj,arr,fname){
				if (!fname){fname = 'text';}
				// create the file
				var txtdoc = new Blob(arr);
				// return promise
				return dBase.db.putAttachment( 
					obj.id, 
					fname, 
					obj.rev, 
					txtdoc, 
					'text/plain'
					);
			};
			// if no doc provided, make a new one.
			if (doc === false){
				var newdoc = {datetime:new Date()}; // empty except for timestamp
				return this.db.post(newdoc).then(function(response){
					attach(response,dataArr,fieldName);
				});
			} else {
				attach(doc,dataArr,fieldName);
			}	
		},
		// store to a CouchDB db, over network, off device
		saveToRemote: function(ip,db){
			var opts = {live: false};
			var fullRemotePath = ip + db; 
			return this.db.replicate.to(fullRemotePath, opts);
		},
		setRemoteServer: function(remoteServer,remoteDbName){
			console.log("setRemoteServer from pouchDbFactory");
			// store values to the obj, and also to local storage 
			// (local storage part could be encapsulated elsewhere)
			var obj = {};
			if (remoteServer){
				// correct IP address (for slashes, etc. basic.) -- prob an angular mod for that
				var correctedIp = this.formatIPAddress(remoteServer);
				//this.remoteServer = correctedIp;
				localStorage.setItem('remoteServer',correctedIp);
				obj.ip = correctedIp;
			}
			if (remoteDbName){
				//this.remoteDbName = remoteDbName;
				localStorage.setItem('remoteDbName',remoteDbName);
				obj.db = remoteDbName;
			}	
			// return the object containing new "clean" values, in case they've been corrected
			console.log(obj);
			return obj;
		},
		// this one DEF would make more sense in a separate service. 
		formatIPAddress: function(addr){
			addr = addr.trim();
			if (addr.substring(0,7) != 'http://' && addr.substring(0,8) != 'https://'){
				addr = 'http://' + addr;
			}
			if (addr.substring(addr.length - 1) != '/'){
				addr += '/';
			}
			// check for port number & if there's not one, make it 5984
			var pattern = /\:\d{4}\/$/;
			var found = pattern.exec(addr);
			if (!found){
				// remove the slash and put it back
				addr = addr.substring(0,addr.length - 1) + ':5984/';
			}
			return addr;
		} 
  };
  
})

.factory('observerActivityFactory', function (pouchDbFactory) {
	// inherit from pouchDb Factory
	var oaFactory = Object.create(pouchDbFactory);
	
	oaFactory.getObserverActivityRecords = function (filterby,limit) {
		
    	// Oy! Repetition! There's surely a better way ...
        var dbmap = function(doc) {
            if(doc.record_type == 'observer_activity') {
	            	emit(doc.start_time, {
	            	record_type:doc.record_type,
	            	activity_name:doc.activity_name,
                    activity_id:doc.activity_id,
                    activity_notes:doc.activity_notes,
                    start_time:doc.start_time,
                    end_time:doc.end_time,
                    id:doc.id 
                });
	        }
        };
		switch(filterby){
			case 'completed':
				dbmap = function(doc) {
		            if(doc.record_type == 'observer_activity' && doc.end_time) {
			            emit(doc.start_time, {
			            record_type:doc.record_type,
		            	activity_name:doc.activity_name,
	                    activity_id:doc.activity_id,
	                    activity_notes:doc.activity_notes,
	                    start_time:doc.start_time,
	                    end_time:doc.end_time,
	                    id:doc.id 
                	});
			        }
		        };
		        break;
			case 'inprogress':
				dbmap = function(doc) {
		            if(doc.record_type == 'observer_activity' && typeof doc.end_time == 'undefined') {
			            emit(doc.start_time, {
		            	record_type:doc.record_type,
		            	activity_name:doc.activity_name,
	                    activity_id:doc.activity_id,
	                    activity_notes:doc.activity_notes,
	                    start_time:doc.start_time,
	                    end_time:doc.end_time,
	                    id:doc.id 
	                });
			        }
		        };
		}
		var options = {reduce: false, descending:true};
		if (parseInt(limit)){
			options.limit = parseInt(limit);
		}

        return pouchDbFactory.db.query({map: dbmap}, options);
        /*pouchDbFactory.db.query({map: dbmap}, {reduce: false, descending:true})
        	.then(function(res){
        		console.log(res);
        		return res;
        	});*/

	};
	// fake data  
	oaFactory.allActivities= [
		    'Traveling by vehicle',
		    'Surveying in vehicle',
		    'Surveying on foot',
		    'Searching/tracking in vehicle',
		    'Searching/tracking on foot',
		    'Observing',
		    'Captures: darting',
		    'Captures: trapping',
		    'Captures: processing',
		    'Camp: personal',
		    'Camp: cooking',
		    'Camp: labwork',
		    'Camp: data entry'];
		
	oaFactory.getAllActivities = function () {
		if (localStorage.getItem('allActivities')){
			this.allActivities = JSON.parse(localStorage.getItem('allActivities'));
		}
		this.allActivities.sort();
    	return this.allActivities;
	};

	return oaFactory;	   
})

.factory('sightingFactory', function (pouchDbFactory) {
	var sFactory = Object.create(pouchDbFactory);
   
	sFactory.getSightings = function (filterby,limit) {
		console.log('getSightings by ' + filterby);
		// defaults to getting all records
	    var dbmap = function(doc) {
            if(doc.record_type == 'sighting') {
	            emit(doc.start_time, {
	            	record_type:doc.record_type,
	            	sighting_id:doc.sighting_id,
					start_time:doc.start_time,
					end_time:doc.end_time,
					sighting_notes: doc.sighting_notes,
					sighting_phenotypes: doc.sighting_phenotypes,
					id:doc.id
	            });
	        }
        };
       	switch(filterby){
			case 'completed':
				dbmap = function(doc) {
		            if(doc.record_type == 'sighting' && doc.end_time) {
			            emit(doc.start_time, {
			            record_type:doc.record_type,
						sighting_id:doc.sighting_id,
						start_time:doc.start_time,
						end_time:doc.end_time,
						sighting_notes: doc.sighting_notes,
						sighting_phenotypes: doc.sighting_phenotypes,
						id:doc.id
				    });
			        }
		        };
		        break;
			case 'inprogress':
				dbmap = function(doc) {
		            if(doc.record_type == 'sighting' && typeof doc.end_time == 'undefined') {
			            emit(doc.start_time, {
			            record_type:doc.record_type,
						sighting_id:doc.sighting_id,
						start_time:doc.start_time,
						end_time:doc.end_time,
						sighting_notes: doc.sighting_notes,
						sighting_phenotypes: doc.sighting_phenotypes,
						id:doc.id
				    });
			        }
		        };
		}
		var options = {reduce: false, descending:true};
		if (parseInt(limit)){
		 	options.limit = parseInt(limit);
		}
		//console.log('options '+ JSON.stringify(options));
		//console.log('about to query');
		
        return pouchDbFactory.db.query({map: dbmap}, options);
        
	};
	sFactory.allPhenotypes = {
		"Flank fringe color": [
		    "not visible",
		    "black",
		    "darker than back",
		    "lighter than back"
		  ],
		  "Nape frill shape": [
		    "not visible",
		    "visible, small",
		    "prominent, curled"
		  ],
		  "Nape frill color": [
		    "black",
		    "darker than back",
		    "lighter than back",
		    "yellow"
		  ],
		  "Hair of ventral surfaces": [
		    "same color as back",
		    "lighter than back",
		    "contrasting, light",
		    "clear yellow"
		  ],
		  "Cheek color": [
		    "grey, little contrast",
		    "contrasting, lighter",
		    "yellowish, strong contrast"
		  ],
		  "Tail carriage": [
		    "arched, no break",
		    "broken, prox. horiz.",
		    "broken, prox. up.",
		    "recurved, riding whip"
		  ],
		  "Paracallosal color": [
		    "uniform dark",
		    "mottled, mainly dark",
		    "mottled, mainly pink",
		    "uniform light"
		  ],
		  "Circumorbital skin": [
		    "light eyelids only",
		    "some light below eye",
		    "pink spectacles"
		  ],
		  "Face patches": [
		    "absent",
		    "slight",
		    "present"
		  ],
		  "Mohawk": [
		    "none",
		    "some",
		    "marked"
		  ],
		  "Nose tip": [
		    "projects past lip",
		    "about level with lip",
		    "clearly behind lip"
		  ]		
	};
	sFactory.getAllPhenotypes = function(){
		// check if they are stored in localstorage
		/*if (localStorage.getItem('allPhenotypes')){
			this.allPhenotypes = JSON.parse(localStorage.getItem('allPhenotypes'));
		} else {
			localStorage.setItem('allPhenotypes',JSON.stringify(this.allPhenotypes));
		}*/
		return this.allPhenotypes;		
	};
	sFactory.createNewPhenotype = function(){
		// need a way to input multidimensional values
	};
	// return the whole factory
    return sFactory;
})
/*.factory('timerDemoService', function(){
	
    return {
    	sayHi: function(s){
    		console.log(s.testTime);
    		console.log('hi');
    		s.$broadcast('timer-clear');
    		s.$broadcast('timer-start');

    	}
    };
})*/
// service function for elapsed time processing
.factory('myTimeService', function($filter,$rootScope,$interval) {
        return {
        	updateElapsedTime: function(mydate,asStr){
        		//console.log('updateElapsedTime');
        		var data;
        		// return as object of values or string "hh:mm:ss"
        		if (asStr){
        			data = this.getTimeStr(mydate);
        		} else {
        			data = this.msToElapsedTime(this.dateToMilli(mydate));	
        		}
        		//console.log(data);
        		$rootScope.$broadcast('ets-timer',data);
        	},
        	dateToMilli: function(mydate){
        		var now = new Date().getTime();
				return now - new Date(mydate).getTime();
        	},
            getTimeStr: function(mydate) {
				// now = new Date().getTime();
				//elapsed_ms = now - new Date(mydate).getTime();
				elapsed_ms = this.dateToMilli(mydate);
				var elapsed_obj = this.msToElapsedTime(elapsed_ms);
				var elapsed_time_str = '';
				if (elapsed_obj.d > 0){
					elapsed_time_str += elapsed_obj.d + ' day';
					if (elapsed_obj.d > 1){ elapsed_time_str += 's'; }
					elapsed_time_str += ', ';
				}
				elapsed_time_str += elapsed_obj.h + ' : ' + elapsed_obj.m + ' : ' + elapsed_obj.s;
				return elapsed_time_str;
            },
            msToElapsedTime: function(ms){
				var d, h, m, s;
				s = Math.floor(ms / 1000);
				m = Math.floor(s / 60);
				s = $filter('zeropad')(s % 60);
				h = Math.floor(m / 60);
				m = $filter('zeropad')(m % 60);
				d = Math.floor(h / 24);
				h = $filter('zeropad')(h % 24);
				return { d: d, h: h, m: m, s: s };
				//return d + " days. " +h + " hours. " + m + " mins ";
			},
			// takes a time string (HH:mm) and a date, and changes the time on that date
			timeToTimeStamp: function(timeStr,dateTime){
				var dateObj = new Date(dateTime);
				var formattedDate = $filter('date')(dateObj, 'MM-dd-yyyy');
				var correctedTimeStamp = new Date(formattedStart + ' ' + timeStr).getTime(); 
				return correctedTimeStamp;
				
				// this part has to be done in the controller unless you can access $scope
				/*if (startOrEnd == 'start'){
					$scope.observerActivity.start_time = correctedTimeStamp;
				} else if (startOrEnd == 'end') { // should we default to one or the other or be explicit?
					$scope.observerActivity.end_time = correctedTimeStamp;
				}*/
			},
			convertGPSDateTime: function(udate, utime) {
				// if the date or time is not given, use today
				// numbers must be strings first in order to use slice()
				var D, M, Y, h, m, s;
				if (!udate){
					dt = new Date();
					//D = this.zeroPad(dt.getDate());
					D = $filter('zeropad')(dt.getDate());
					M = $filter('zeropad')(dt.getMonth());
					Y = dt.getFullYear();
				} else {
					udate = udate.toString();
					D = parseInt(udate.slice(0, 2), 10);
					M = parseInt(udate.slice(2, 4), 10);
					Y = parseInt(udate.slice(4, 6), 10) + 2000;
				}
				if (!utime){
					dt = new Date();
					h = $filter('zeropad')(dt.getHours());
					m = $filter('zeropad')(dt.getMinutes());
					s = $filter('zeropad')(dt.getSeconds());
				} else {
					utime = utime.toString();
					h = parseInt(utime.slice(0, 2), 10);
					m = parseInt(utime.slice(2, 4), 10);
					s = parseInt(utime.slice(4, 6), 10);
				}
				
				return new Date(Date.UTC(Y, M, D, h, m, s));
			}
    	}; //end return
})
.factory('nmeaFactory',function(myTimeService,bluetoothFactory,$q,$timeout){
	return {
		firstSentenceType: false, // might think of this as the "control sentence"
		nmeaPacket: [],
		nmeaCompletePacket: [], //? this one will get sent to outside world
		debug: 'meow meow',
		
		// called by the outside world:
		getNmeaPacket: function(){
			var deferred = $q.defer();
			// set up to use the parser
			// so it can run parse() func w/o access any refs to 'this' in the func
			var myParser = this.nmeaParser; 
			var done = false;
			console.log('getNmeaPacket from factory');
			// subscribe to bluetooth, start the chain of BT->data->parse->return nmea obj
			this.subBt(function(packet){
				console.log("COMPLETE: " + JSON.stringify(packet));	
				// parse it!
				var parsed = myParser(packet);
				console.log("Parsed");
				console.log(JSON.stringify(parsed));
				done = true;
				deferred.resolve(packet); //send back the data via promise 
			});
			// if no data is coming in, time out and fail
			$timeout(function(){
				console.log("IN TIMEOUT: done?" + done);
				if (done !== true){
					console.log("Timed out");
					deferred.reject("Timed out"); //reject the service in case of timeout
		      	}
		      }, 1000);
		        
			return deferred.promise;
		},

		//subscribe to Bluetooth
		subBt: function(callback){
			var firstSentenceType = false; // might think of this as the "control sentence"
			var nmeaPacket = [];
			var nmeaCompletePacket = [];
			var controlVar = 1; //for testing

			// function to send to register:
			var processNmeaStream = function(nmeaSentenceData,subscriberId){ // these are the values that are RECEIVED, via callback
				//console.log('process nmea stream: ' + nmeaSentenceData );
				var sentenceType = nmeaSentenceData.split(',')[0]; // eg, $GPXYZ
				controlVar++;
				console.log("control var: " + controlVar);
		
				// use the first sentence we see as the base, to know when it's made a round, and to make a new packet
				if (!firstSentenceType){
					firstSentenceType = sentenceType;
				}

				// if it has made its full round of sentences, it's a packet. stop collecting data
				if (firstSentenceType == sentenceType && nmeaPacket.length > 0){
					// same the new packet
					nmeaCompletePacket = nmeaPacket;
					console.log("GOT PACKET!");
					// clear the working packet
					nmeaPacket = [];
					// unsubscribe from BT !
					bluetoothFactory.removeSubscriber(subscriberId);

					//!! --- Here's where the nmea object finally gets returned --- !!//
					callback(nmeaCompletePacket);
				}	

				// add data to the packet
				nmeaPacket.push(nmeaSentenceData);
				console.log('added to packet: ' + nmeaSentenceData );		
			};

			// +++++ SUBSCRIBE! ++++++ //
			bluetoothFactory.registerSubscriber(processNmeaStream);
			// registerSubscriber will hand back the data and a subscriber id -->processNmeaStream
		},
		
		// ** TODO: for raw text: **
		// store everything from the packet into the master array of sentences
		// this.nmeaRawArr.push.apply(this.nmeaRawArr,this.nmeaPacket);
		
		// take two. put all the parse funcs inside one. -- so you don't have to ref 'this'
		nmeaParser: function(packet){
			console.log('parser ' + packet);
			var finalParse = function(strOrArr){
				console.log('PARSE NMEA');
				if (strOrArr instanceof Array){
					sArr = [];
					for (var i in strOrArr){
						console.log(strOrArr[i]);
						sArr.push(sentenceToObj(strOrArr[i]));
					}
					return sArr;
				} else if (typeof strOrArr === 'string') {
					return sentenceToObj(strOrArr);
				}
			};
			var sentenceToObj =  function(nmeaStr){
				// example sentence string: $GPRMC,180826.9,V,4043.79444,N,07359.60944,W,,,160614,013.0,W,N*19
				// make it an array:
				nmeaArr = nmeaStr.split(",");
				
				// find the type
				typeProp = nmeaArr[0].slice(-3).toLowerCase(); //eg: rmc
				// process the sentence if the type is in the nmeaDecoder object
				if(typeProp in decoder){
					nmeaObj = decoder[typeProp](nmeaArr);
				} else {
					nmeaObj = {};
					//add the sentence type as a named field
					nmeaObj.sentenceType = nmeaArr[0];
					// everything else is a numeric field
					for (var i=0; i < nmeaArr.length; i++){
						nmeaObj[i] = nmeaArr[i]; 
					}
				}
				// store the whole sentence, regardless of type
				nmeaObj.nmeaSentence = nmeaStr;		
				return nmeaObj;
			};
			var decoder = {
				rmc: function(nmeaArr){
					dt = myTimeService.convertGPSDateTime(nmeaArr[9],nmeaArr[1]); //human-readable datetime
					return {
						sentenceType: nmeaArr[0],
						UTtime: nmeaArr[1],
						status: nmeaArr[2],
						latitude: nmeaArr[3],
						dirNS: nmeaArr[4],
						longitude: nmeaArr[5],
						dirEW: nmeaArr[6],
						speed: nmeaArr[7],
						track: nmeaArr[8],
						UTdate: nmeaArr[9],
						variation: nmeaArr[10],
						EorW: nmeaArr[11],
						checksum: nmeaArr[12],
						UTCdateTime: dt
					};
				},
				gsv: function(nmeaArr) {
					/* 
				  	GSV has a variable number of fields, depending on the number of satellites found
						example: $GPGSV,3,1,12, 05,58,322,36, 02,55,032,, 26,50,173,, 04,31,085, 00*79
					The min number of fields is 4. After that, each satellite has a group of 4 values 
					
				  	*/
					var numFields = (nmeaArr.length - 4) / 4;
					var sats = [];
					for (var i=0; i < numFields; i++) {
						var offset = i * 4 + 4;
						sats.push({id: nmeaArr[offset],
							elevationDeg: +nmeaArr[offset+1],
							azimuthTrue: +nmeaArr[offset+2],
							SNRdB: +nmeaArr[offset+3]});
					}
					var checksum = nmeaArr[(nmeaArr.length - 1)];
					return {
						sentenceType: nmeaArr[0],
						numMsgs: nmeaArr[1],
						msgNum: nmeaArr[2],
						satsInView: nmeaArr[3],
						satellites: sats,
						checksum: checksum
					};
				},
				gga: function(nmeaArr){
					dt = myTimeService.convertGPSDateTime(false,nmeaArr[1]); //human-readable datetime
					var FIX_TYPE = ['none', 'fix', 'delta'];
					return {
						sentenceType: nmeaArr[0],
						datetime: dt,
						lat: nmeaArr[2],
						latPole: nmeaArr[3],
						lon: nmeaArr[4],
						lonPole: nmeaArr[5],
						fixType: FIX_TYPE[nmeaArr[6]],
						numSat: nmeaArr[7],
						horDilution: nmeaArr[8],
						alt: nmeaArr[9],
						altUnit: nmeaArr[10],
						geoidalSep: nmeaArr[11],
						geoidalSepUnit: nmeaArr[12],
						differentialAge: nmeaArr[13],
						differentialRefStn: nmeaArr[14]
					};
				}
			};
			return finalParse(packet);
		},


		// take in sentence string or array of sentence strings
		// and return a object or array of objects
		parse: function(strOrArr){
			console.log('PARSE NMEA');
			if (strOrArr instanceof Array){
				sArr = [];
				for (var i in strOrArr){
					console.log(strOrArr[i]);
					sArr.push(this.sentenceToObj(strOrArr[i]));
				}
				return sArr;
			} else if (typeof strOrArr === 'string') {
				return this.sentenceToObj(strOrArr);
			}
		},
		/* 
		Break up NMEA sentences of certain types into known fields
		Handles: RMC, GSV, GGA
		Other common types, to add: GSA, VTG
		*/
		decoder: {
			rmc: function(nmeaArr){
				dt = myTimeService.convertGPSDateTime(nmeaArr[9],nmeaArr[1]); //human-readable datetime
				return {
					sentenceType: nmeaArr[0],
					UTtime: nmeaArr[1],
					status: nmeaArr[2],
					latitude: nmeaArr[3],
					dirNS: nmeaArr[4],
					longitude: nmeaArr[5],
					dirEW: nmeaArr[6],
					speed: nmeaArr[7],
					track: nmeaArr[8],
					UTdate: nmeaArr[9],
					variation: nmeaArr[10],
					EorW: nmeaArr[11],
					checksum: nmeaArr[12],
					UTCdateTime: dt
				};
			},
			gsv: function(nmeaArr) {
				/* 
			  	GSV has a variable number of fields, depending on the number of satellites found
					example: $GPGSV,3,1,12, 05,58,322,36, 02,55,032,, 26,50,173,, 04,31,085, 00*79
				The min number of fields is 4. After that, each satellite has a group of 4 values 
				
			  	*/
				var numFields = (nmeaArr.length - 4) / 4;
				var sats = [];
				for (var i=0; i < numFields; i++) {
					var offset = i * 4 + 4;
					sats.push({id: nmeaArr[offset],
						elevationDeg: +nmeaArr[offset+1],
						azimuthTrue: +nmeaArr[offset+2],
						SNRdB: +nmeaArr[offset+3]});
				}
				var checksum = nmeaArr[(nmeaArr.length - 1)];
				return {
					sentenceType: nmeaArr[0],
					numMsgs: nmeaArr[1],
					msgNum: nmeaArr[2],
					satsInView: nmeaArr[3],
					satellites: sats,
					checksum: checksum
				};
			},
			gga: function(nmeaArr){
				dt = myTimeService.convertGPSDateTime(false,nmeaArr[1]); //human-readable datetime
				var FIX_TYPE = ['none', 'fix', 'delta'];
				return {
					sentenceType: nmeaArr[0],
					datetime: dt,
					lat: nmeaArr[2],
					latPole: nmeaArr[3],
					lon: nmeaArr[4],
					lonPole: nmeaArr[5],
					fixType: FIX_TYPE[nmeaArr[6]],
					numSat: nmeaArr[7],
					horDilution: nmeaArr[8],
					alt: nmeaArr[9],
					altUnit: nmeaArr[10],
					geoidalSep: nmeaArr[11],
					geoidalSepUnit: nmeaArr[12],
					differentialAge: nmeaArr[13],
					differentialRefStn: nmeaArr[14]
				};
			}
		},
		sentenceToObj: function(nmeaStr){
			// example sentence string: $GPRMC,180826.9,V,4043.79444,N,07359.60944,W,,,160614,013.0,W,N*19
			// make it an array:
			nmeaArr = nmeaStr.split(",");
			
			// find the type
			typeProp = nmeaArr[0].slice(-3).toLowerCase(); //eg: rmc
			// process the sentence if the type is in the nmeaDecoder object
			if(typeProp in this.decoder){
				nmeaObj = this.decoder[typeProp](nmeaArr);
			} else {
				nmeaObj = {};
				//add the sentence type as a named field
				nmeaObj.sentenceType = nmeaArr[0];
				// everything else is a numeric field
				for (var i=0; i < nmeaArr.length; i++){
					nmeaObj[i] = nmeaArr[i]; 
				}
			}
			// store the whole sentence, regardless of type
			nmeaObj.nmeaSentence = nmeaStr;		
			return nmeaObj;
		},
		
		zeroPad: function(num){
			return (num < 10) ? String('0') + num : num; 
		}

	};
})
/*
IMPORTANT! remember to enable bluetooth plugin for phonegap for this to work
*/
.factory('bluetoothFactory', function($rootScope) {
	return {
		deviceAddress: "AA:BB:CC:DD:EE:FF",  // get your mac address from bluetoothSerial.list
		deviceName: "No Name",
		debug: 'data here debug. kittens!',

		// Check Bluetooth, list ports if enabled:
		findDevices: function(callback) { 
			// if isEnabled returns failure, this function is called:
			var notEnabled = function() {
				console.log("Bluetooth is not enabled.");

			};
			
			// if isEnabled returns success, this function is called:
			var listPorts = function() {
				// list the available BT ports:
				// bluetoothSerial.list(successFunc, failureFunc);
				bluetoothSerial.list(callback, //<--sends results to controller	
					// called if something goes wrong with isEnabled:
					function(error) {
						console.log(JSON.stringify(error));
					}
				);
			};
						
			// ****** check if Bluetooth is on: ****** //
			bluetoothSerial.isEnabled(
				listPorts,
				notEnabled
			);
		},
		
		connectionManager: function(){
			// use named object to better manage scope
			var mc = {
				delegate: function(){ //delegate
					bluetoothSerial.isConnected(mc.disconnect, mc.connect);
				}, 
				connect: function(deviceAddress){
					console.log('connect called');
					// attempt to connect
					bluetoothSerial.connect(
						deviceAddress,  // device to connect to
						mc.connectSuccess,    // on success
						mc.connectFail    // on failure
					);
				},
				disconnect: function(){
					bluetoothSerial.disconnect(
						function(){ // unsubscribe
							$rootScope.$broadcast('bt-disconnected');
							bluetoothSerial.unsubscribe();
						},     
						function(){ //error
							console.log('disconnect error');
						}      
					);	
				},
				connectSuccess: function(){
					console.log('connectSuccess func called');
					$rootScope.$broadcast('bt-connected');
					$rootScope.subscriberRegistry = {};
					bluetoothSerial.isConnected(
							function(){console.log('connectCheck: YES');},
							function(){console.log('connectCheck: NO');}
						);
					
					//bluetooth subscribe
					bluetoothSerial.subscribe('\n', function(data){
						mc.dataHandler(data);
					},function(){console.log('subscribe failed');});
				},
				connectFail: function(){
					$rootScope.$broadcast('bt-connection-fail');
					console.log('fail');
				},
				dataHandler: function(data){
					if ( Object.keys($rootScope.subscriberRegistry).length > 0 ){
						//console.log(' ========= SUBSCRIBERS: ============ ');
						for (var id in $rootScope.subscriberRegistry){
							// call the function, sending back data
							$rootScope.subscriberRegistry[id](data,id); // also send back subscriber id, so it can be unsubscribed
						}
					} else {
						//console.log(' ========= NO SUBSCRIBERS ============ ');
					}
				}
			};
			return mc;
		},
		// called by outside class to put their function in registry
		registerSubscriber: function(func){
			console.log('register subscriber from bluetoothFactory');
			//console.log(func);
			var id = new Date().getTime();
			// store the function name int registry with a unique id
			//this.subscriberRegistry[id] = func;
			console.log(JSON.stringify($rootScope.subscriberRegistry));
			$rootScope.subscriberRegistry[id] = func;
		},
		removeSubscriber: function(id){
			console.log('remove subscriber from bluetoothFactory');
			// remove from registry w/ id #
			delete $rootScope.subscriberRegistry[id];	
		}
	};
});