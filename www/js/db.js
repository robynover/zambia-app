var dBase = {
	//dbname: 'sightings',
	db: new PouchDB('zambia'), 
	remoteServer: 'http://ec2-54-84-90-63.compute-1.amazonaws.com:5984/zambia',

	all: function(callback){ //takes a callback function in order to return records
		this.db.allDocs({include_docs: true},  
			function (err, doc) {
		    	callback(doc.rows);
			});
	},
	add: function(record,callback){
		this.db.post(record, function (err, result) {
			if (!err) {
				console.log('Successfully added a record!');
				//alert('Successfully added a record!');
				//console.log(result);
				callback(result);
			} else {
				console.log('could not add record');
			}
		});
	},
	update: function(record,_id,_rev,callback){
		this.db.put(record, _id, _rev, function (err, result) {
			if (!err) {
				console.log('Successfully updated a record!');
				//console.log(result);
				callback(result);
			} else {
				console.log('could not add record');
			}
		});
	},
	find: function(id,callback){
		this.db.get(id, function(err, doc){
			if (!err) {
				callback(doc);
			} else {
				//error
			}
		});
	},
	sync: function(){ 
		//console.log('sync clicked');
		//app.debug('sync clicked');
		var opts = {continuous: false,complete:function(){alert('Synced to Couch');}};
		this.db.replicate.to(this.remoteServer, opts);	
	}
	/*
	,
	findCompletedActivities:function(){
		map = function(doc) {
			if(doc.objtype == 'activity' && doc.end_time) {
		   	 emit(doc._id, {activity_name:doc.activity_name,activity_id:doc.activity_id,start_time:doc.start_time,end_time:doc.end_time});
		  	}
		};
		this.db.query({map: map}, {reduce: false}, function(err, response) { console.log(response)});
	}*/

	

	/*
	reset: function(){
		this.db.destroy();
		this.db = PouchDB('sightings'),
	}*/

};