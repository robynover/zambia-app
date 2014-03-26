var dBase = {
	db: PouchDB('sightings'), 
	remoteServer: 'http://ec2-54-84-90-63.compute-1.amazonaws.com:5984/sightings',

	all: function(callback){ //takes a callback function in order to return records
		this.db.allDocs({include_docs: true},  
			function (err, doc) {
		    	callback(doc.rows);
			});
	},
	add: function(record){
		this.db.post(record, function callback(err, result) {
			if (!err) {
				console.log('Successfully added a record!');
				//alert('Successfully added a record!');
			} else {
				console.log('could not add record');
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
	reset: function(){
		this.db.destroy();
		this.db = PouchDB('sightings'),
	}*/

};