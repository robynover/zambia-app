/*
not using this for now: 
    nice for strict data modeling but it's not that helpful bc it can't use functions -
    functions inside objects won't work when passed to PouchDB bc of a problem with HTML5 WebWorkers
*/
var Sighting = function(){
	this.sighting_id = null;
	this.start_time = '';
    this.end_time = '';
    this.sighting_notes = '';
    this.census_animals = []; //todo
    this.phenotype_sightings =[];
        /* structure of each phenotype:
        { 
            phenotype_id: 0,
            phenotype_name: "",
            phenotype_notes: "",
            frequency: 0.0
        }
        */
    /*
    NOTE:
    functions inside objects won't work when passed to PouchDB bc of a problem with HTML5 WebWorkers
    http://www.nowherenearithaca.com/2013/07/solved-chrome-web-workers-and.html

    */

    /*this.getCompletedSightings = function(callback){
        map = function(doc) {
            if(doc.objtype == 'sighting' && doc.end_time) {
             emit(doc._id, {sighting_id:doc.sighting_id,
                            start_time:doc.start_time,
                            end_time:doc.end_time,
                            sighting_notes: doc.sighting_notes,
                            phenotype_sightings: doc.phenotype_sightings,
                            id:doc._id
                            });
            }
        };
        dBase.db.query({map: map}, {reduce: false}, function(err, response) { 
            callback(response);
        });
    };*/
    /*
    this.saveSighting = function(callback){

        this.objtype = 'sighting';
        
        //fix scoping to use in callbacks
        var self = this;
        // if this is an existing sighting
        console.log(self);
        if(self._id && self._rev){
            
            dBase.update(self,self._id,self._rev,function(results){
                console.log(results);
                self._rev = results.rev;
            });

        } else { //add new
           dBase.add(self,function(results){
                self._id = results.id;
                callback();
            }); 
        }
        
    }; */

    /*this.buildSightingsList = function(ul_el){
        // ul_el is jQuery object for ul element 
        this.getCompletedSightings(function(sightings){
            ul_el.html('');
            //edit_btn = '<a href="#sighting_detail" data-rel="popup" 
            //class="ui-btn ui-shadow ui-corner-all ui-icon-edit ui-btn-icon-left">';
            rows = sightings.rows;
            for (r in rows){
                doc = rows[r].value;
                //console.log(doc);
                li_tag = $('<li></li>');
                a_tag = $('<a></a>');
                a_tag.attr({href:"#sighting_detail",'data-dbid':doc.id});
                a_tag.addClass("sighting_item ui-btn ui-shadow ui-corner-all ui-icon-eye ui-btn-icon-left");
                //li = '<li>' + edit_btn;
                a_text = 'start: ' + moment(doc.start_time).format(app.time_only_format);
                a_text += '&nbsp;end: ' + moment(doc.end_time).format(app.time_only_format);
                a_tag.html(a_text);
                li_tag.append(a_tag);
                //li += doc.id;
                //li += '</a></li>'; 
                ul_el.append(li_tag);
            }
            ul_el.listview('refresh'); //jQm re-parse css/js     
        });
    };*/
};
