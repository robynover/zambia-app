var dBase = {
	// fake constants
	TO_LOCAL: 1,
	FROM_LOCAL: 2,
	TO_REMOTE: 3,
	FROM_REMOTE: 4, 
	
	init: function (dbname, opts){ 
		this.db = new PouchDB(dbname);
		if (opts.local){
			this.localServer = opts.local;
		}
		if (opts.remote){
			this.remoteServer = opts.remote;
		}
		// for future: split the base URL and the name of the db for local and remote servers
		// ie, 'http://myhost.com:5984/mydb' vs. 'http://myhost.com:5984'
		if (opts.local_dbname){}
		if (opts.remote_dbname){}
	},
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
	update: function(record,callback){
		this.db.put(record, function (err, result) {
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
	couchSync: function(dir){ 
		// direction options: TO_REMOTE, FROM_REMOTE, TO_LOCAL, FROM_LOCAL
		if (!dir){dir = this.TO_LOCAL;}
		var opts = {continuous: false, complete:function(err,res){
															alert('Sync complete');
															/*app.debug('<h2>Error</h2>');
															app.debug(JSON.stringify(err));
															app.debug ('<h2>Response</h2>');
															app.debug(JSON.stringify(res));*/
															
														}
										};
		
		//console.log(this.db.replicate);
		switch (dir){
			case this.TO_REMOTE:
				alert('to remote');
				this.db.replicate.to(this.remoteServer, opts); 
				break;

			case this.FROM_REMOTE:
				this.db.replicate.from(this.remoteServer, opts);
				break;

			case this.TO_LOCAL:
				alert('to local');
				this.db.replicate.to(this.localServer, opts);
				break;

			case this.FROM_LOCAL:
				this.db.replicate.from(this.localServer, opts);
				break;
		}		
	}
	/*sync: function(){ 
		//console.log('sync clicked');
		//app.debug('sync clicked');
		var opts = {continuous: false,complete:function(){alert('Synced to Couch');}};
		this.db.replicate.to(this.remoteServer, opts);	
	}*/
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