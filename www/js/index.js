var app = {
    // properties
    obs_activity_clock_running: false,
    current_sighting: {},
    sighting_currently_editing: {},
    sighting_notes: '',
    current_obs_activities: [],
    timestamp_format: "YYYY-MM-DD HH:mm:ss.SSS ZZ", // for momentJS library
    time_only_format: "HH:mm",
    date_only_format: "YYYY-MM-DD",
    activity_listening: false,
    all_phenotypes : {}, //initial set of phenotypes
    current_avail_phenotypes: {},// holds the phenotypes available for each sighting
   
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.onDeviceReady(); //uncomment for browser debugging
        
        //init data
        app.all_phenotypes = studyData.all_phenotypes; //initial set of phenotypes
        app.current_avail_phenotypes = studyData.all_phenotypes; // holds the phenotypes available for each sighting
        // empty array (setting datatype to Array)
        app.current_sighting.phenotype_sightings = [];
    },

    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('#obs_activity_list > li').bind('click',this.startObsActivityRecord);
        $('#sighting_time').bind('click',this.trackSightingTime);
        $('#new_act_btn').bind('click',this.obsActivityListener); 
        $('#add_pheno_btn').bind('click',this.makePhenotypeSelect);
        $( window ).on( "pagechange",this.pageChangeListener);
        $('#activity_notes_done_btn').bind('click', this.addActivityNotes);
        $('#save_pheno_obs').bind('click',this.savePhenotypeToSighting);
        $('#phenotype_select').bind('change',this.phenoSelectListener);

        // use .on() instead of .bind() to apply to elements added dynamically later
        $('#current_activity_records').on('click','.activity_edit_btn',function(){
            //attach record id to activity notes form
            rid = $(this).attr('data-recordid');
            $('#activity_notes').attr('data-recordid',rid);
            dBase.find(rid,function(doc){
                $('#activity_notes_field').val(doc.activity_notes);
            });
        });
        $('#current_activity_records').on('click','.activity_stop_btn',this.stopActivityBtnListener);
        $('#reset').bind('click',this.resetDB);
        $('ul.sightings').on('click','.sighting_item',app.buildSightingDetailPg);
        $('#sighting_detail').on('click','.edit-site-start',function(){$('#site_start_input').toggle()});
        $('#sighting_detail').on('click','.edit-site-end',function(){$('#site_end_input').toggle()});
        $('#sighting_detail').on('click','#update_sighting_btn',this.updateSightingListener);

        
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        //app.debug('device ready');
        // set size of pop-ups
        $('#new_activity,#pheno_obs,#sighting_detail').css({
                                'min-width':$(window).width() * .75,
                                'min-height':$(window).height() * .75,
                                'padding':'1em'
                            });   

        // build sightings log list -- this may be attached to an event later
        app.buildSightingsList();   
    },
    
    // ---------- Listeners -------- //
    obsActivityListener: function(){
        activity_name = $('#new_activity_field').val();
        // need to make a temporary id # -- using text instead of number
        activity_id = 'temp_id_' + activity_name;
        actObj = {};
        actObj.activity_id = activity_id;
        actObj.activity_name = activity_name;
        //app.current_obs_activities[activity_id] = actObj;
        app.current_obs_activities.push(actObj);
        index = app.current_obs_activities.length - 1;
        // start activity timer
        trackedObj = app.trackObserverActivityTime(index);
        $('#current_activity_records').show();
        //app.addActivityRecordLi(activity_name,activity_id,trackedObj.start_time);
        app.addActivityRecordLi(activity_name,index,trackedObj.start_time);

        //add new activity to selection list
        // remove last child class and add new last child
        $('#obs_activity_list li:last-child').removeClass('ui-last-child');
        $('#obs_activity_list').append('<li class="ui-last-child" data-actid="'+activity_id+'"><a class="ui-btn" href="#">'+activity_name+'</a></li>');

        //add to master list of activities
        studyData.all_activities[activity_id] = activity_name;
    },
    startObsActivityRecord: function(){ // new record
        activity_name = $(this).text();
        activity_id = $(this).attr('data-actid');
        if (app.showConfirm('Start '+ activity_name + '?')){
            actObj = {};
            actObj.activity_name = activity_name;
            actObj.activity_id = activity_id;
            actObj.start_time = moment().format(app.timestamp_format);
            // store in local db
            app.saveActivity(actObj,function(r){
                //console.log('save done '+ actObj._id);
                // UI
                app.addActivityRecordLi(actObj.activity_name,actObj._id,actObj.start_time);
                $('#current_activity_records').show();
            });
            //console.log(actObj);   
        }
    },
    endObsActivityRecord: function(id,callback){ // can take an existing doc object or an id number to find the doc
        if ((typeof id == "object" ) && (id !== null)){
            doc = id;
            doc.end_time = moment().format(app.timestamp_format);
            app.saveActivity(doc);
        } else {
            // find the record, do the update
            dBase.find(id,function(doc){
                doc.end_time = moment().format(app.timestamp_format);
                app.saveActivity(doc);
            });
        }
        //callback('test');
        
    },
    updateObsActivityNotes: function(id,notes){
        dBase.find(id,function(doc){
            doc.activity_notes = notes;
            app.saveActivity(doc);
        });
    },
    
    stopActivityBtnListener:function(){
        record_id = $(this).attr('data-recordid');
        var this_el = $(this);
        //console.log('stop activity click '+record_id);
        dBase.find(record_id,function(doc){
            if (app.showConfirm('Stop '+ doc.activity_name + '?')){
                app.endObsActivityRecord(doc,function(){
                    //UI
                    el = this_el.parent();
                    this_el.remove();
                    el.append(' Stopped at <b>'+ moment().format(app.time_only_format) + '</b>');
                    el.addClass('stopped');
                    el.fadeOut(3000);
                });    
            }
        });
        
    },
    pageChangeListener: function(){
        if (location.hash == '#activities_log'){
            app.buildCompletedActivitiesList();
        }
    },
    
    savePhenotypeToSighting: function(){
        /* phenotype object structure
        { 
            phenotype_id: 0,
            phenotype_name: "",
            phenotype_notes: "",
            frequency: 0.0
        };*/
        
        ps = {}; //new phenotype object
        // is this ia new phenotype?
        if ($('#new_phenotype').val().length > 1){
            ps.phenotype_name = $('#new_phenotype').val();
            // ADD NEW one to the master list of phenotypes
            //    ~ use name as id bc there is not an id from the db yet
            app.all_phenotypes[ps.phenotype_name] = ps.phenotype_name;
        } else {
            ps.phenotype_id = $('#phenotype_select').val();
            ps.phenotype_name = $('#phenotype_select option:selected').text();
            // REMOVE it from list of currently available phenotypes
            delete app.current_avail_phenotypes[ps.phenotype_id];
        }
        ps.frequency = $('#frequency_slider').val()/100;
        ps.phenotype_notes = $('#pheno_notes').val();

        // ADD it to the array of phenotypes for this sighting obj
        app.current_sighting.phenotype_sightings.push(ps);
        
        // UI
        // add to the display list of stored records
        $('#pheno_obs_records').show();
        $('#pheno_obs_records ul').append('<li>' + ps.phenotype_name + ' ' + ps.frequency+'</li>'); 

        // clear/reset all the values in the phenotype form
        $('#frequency_slider').val(50); //slider input element
        // slider widget created by jQmobile
        sliderwidget = $("a.ui-slider-handle[aria-labelledby='frequency_slider-label']");
        sliderwidget.attr({
                            'aria-valuenow': 50,
                            title: 50,
                            'aria-valuetext': 50,
                            }); 
        sliderwidget.css('left','50%');
        $('[type="range"]').slider(); //jQm func to reset slider (?)

        $('#pheno_notes').val('');
        $('#new_phenotype').val('');
        $('#new_phenotype').hide();
        $('#phenotype_select').val(0);
        // jQm adds a <span> with the selected value. clear the value
        $('#phenotype_select-button > span').text(' . '); // the period is a placeholder bc UI weirdness

        // remove selected phenotype from option list -- each can only be used once per sighting
        $('#phenotype_select option:selected').remove();
        
    },
    phenoSelectListener: function(){
        if ($(this).val() == 'new'){
            $('#new_phenotype').show();
        } else {
            $('#new_phenotype').hide();
        }
    },
    updateSightingListener: function(){
        app.sighting_currently_editing.sighting_notes = $('#sighting_detail > p.sighting_notes').text();
        orig_date = moment(app.sighting_currently_editing.start_time).format(app.date_only_format);
        if(isNaN(orig_date)){ // if the date got corrupted, set it to today
            orig_date = moment().format(app.date_only_format);
        }

        updated_start = $('#sighting_detail input#hr_start').val() + ':'+$('#sighting_detail input#min_start').val();
        updated_end = $('#sighting_detail input#hr_end').val() + ':'+$('#sighting_detail input#min_end').val();
        app.sighting_currently_editing.start_time = moment(orig_date + ' ' + updated_start).format(app.timestamp_format);
        app.sighting_currently_editing.end_time = moment(orig_date + ' ' + updated_end).format(app.timestamp_format);

        //console.log(app.sighting_currently_editing._id);
        //console.log(updated_start);
        //console.log(moment(orig_date + ' ' + updated_end).format(app.timestamp_format));
        app.saveSighting(app.sighting_currently_editing,function(){
            // close the pop-up window
            $("#sighting_detail").popup("close", {"transition": "pop"});

            /* change the li value <-- you could do this and not reload from DB, but it won't update the sort order
            new_content = 'start: ' + moment(app.sighting_currently_editing.start_time).format(app.time_only_format);
            new_content += ' end: ' + moment(app.sighting_currently_editing.end_time).format(app.time_only_format);
            $("a[data-dbid='"+ app.sighting_currently_editing._id +"']").text(new_content);
            */
            app.buildSightingsList();
        });
    },

    // ------- Controllers ---------- 
    trackObserverActivityTime: function(id){
        actObj = app.current_obs_activities[id];
        if (actObj){
            if (actObj.clock_running){ 
                actObj.clock_running = false; // stop timer
                actObj.end_time = moment().format(app.timestamp_format); 
            } else { 
                actObj.clock_running = true; // start timer
                actObj.start_time = moment().format(app.timestamp_format); 
            }
            return actObj;
        } else {
            return false;
        }    
    },
    trackSightingTime: function(){
        if (app.current_sighting.start_time){ //STOP time if it's been started
            app.current_sighting.end_time = moment().format(app.timestamp_format);
            app.current_sighting.sighting_notes = $('#sighting_notes').val();

            // ---- Save it.------ //
            app.saveSighting(app.current_sighting,function(){
                // make a new empty object for the next sighting
                app.current_sighting = {};
                // update the sightings list
                app.buildSightingsList();
            });

            // UI
            $(this).html('Start Sighting');
            $(this).attr('data-icon','plus');
            $(this).addClass('ui-icon-plus');
            $(this).removeClass('ui-icon-minus');
            $('#add_pheno_btn').hide();
            $('#pheno_obs_records').slideUp();
            $('#sighting_notes_wrap').slideUp();
            $('#sighting_notes').val('');
            $('#pheno_obs_records ul').html('');
            $('#sightings_status_bar').html('Sighting saved.');
          
        } else { //START time
            app.current_sighting.start_time = moment().format(app.timestamp_format);//Date.now();

            // with each new sighting, get the most recent list of all phenotypes 
            //      have to make a new object in order to "clone", otherwise it's passed by ref
            //      app.current_avail_phenotypes = app.all_phenotypes; //<-- copies by ref
            app.current_avail_phenotypes = [];
            for (p in app.all_phenotypes){
                app.current_avail_phenotypes[p] = app.all_phenotypes[p];
            }

            // UI
            // status bar 
            $('#sightings_status_bar').html('Sighting in Progress');
            $(this).html('End Sighting');
            $(this).attr('data-icon','minus');
            $(this).addClass('ui-icon-minus');
            $(this).removeClass('ui-icon-plus');
            
            // show sighting started
            //$('#sighting_status').html('Sighting started at <strong>' + moment().format(app.time_only_format) + '</strong>');
            //show sighting notes button
            $('#sighting_notes_wrap').show();
            // show add phenotypes button
            $('#add_pheno_btn').show();
            $('#pheno_obs_records').show();

            // open up phenotype entry when timer has started
            //$('#pheno_obs').show();
            //$('.sighting_title').hide();
            
            // hide records div -- no records yet
            //$('#pheno_obs_records').hide();
        } 
    },
    getCompletedActivities: function(callback){
        // pouch db map/reduce func: get objects of type 'activity' that have ended
        map = function(doc) {
            if(doc.objtype == 'activity' && doc.end_time) {
             emit(doc._id, {activity_name:doc.activity_name,activity_id:doc.activity_id,start_time:doc.start_time,end_time:doc.end_time});
            }
        };
        dBase.db.query({map: map}, {reduce: false}, function(err, response) { 
            console.log(response);
            callback(response);
        });
    },
    // TODO: order by timestamp!!
    getCompletedSightings: function(callback){
        map = function(doc) {
            if(doc.objtype == 'sighting' && doc.end_time) {
             emit(doc.start_time, {sighting_id:doc.sighting_id,
                            start_time:doc.start_time,
                            end_time:doc.end_time,
                            sighting_notes: doc.sighting_notes,
                            phenotype_sightings: doc.phenotype_sightings,
                            id:doc._id
                            });
            }
        };
        dBase.db.query({map: map}, {reduce: false, descending:true}, function(err, response) { 
            //console.log(response);
            callback(response);
        });
    },
    showActivityNotes: function(){
        record_id = $(this).attr('data-recordid');
        dBase.find(record_id,function(doc){
            $('#activity_notes_field').val(doc.activity_notes);
        });
        $('#activity_notes').attr('data-recordid',record_id);
        $('#activity_notes').show();
    },
    addActivityNotes: function(){
        // 'this' is the "Done" button
        //console.log($('#activity_notes').attr('data-recordid'));
        id = $('#activity_notes').attr('data-recordid');
        notes = $('#activity_notes_field').val();
        app.updateObsActivityNotes(id,notes);
        // clear values
        $('#activity_notes_field').val('');
        $('#activity_notes').removeAttr('data-recordid');

    },

    // ------------- UI --------------
    makePhenotypeSelect: function(){
        /*console.log('make select btn');
        console.log('current: ');
        console.log(app.current_avail_phenotypes);
        console.log('all: ');
        console.log(app.all_phenotypes);*/
        //$('#phenotype_select').html('<option value=""></option>');
        $('#phenotype_select').html('');
        for (p in app.current_avail_phenotypes){
            $('#phenotype_select').append('<option value="'+ p +'">'+ app.current_avail_phenotypes[p] + '</option>');
        }
        $('#phenotype_select').append('<option value="new">New Phenotype</option>'); 
        // to do: add listener to show an input box when "New" is chosen
    },
    addActivityRecordLi: function(activity_name,id,start_time){
        li_text = activity_name + ', started at <strong>' + moment(start_time).format(app.time_only_format) + '</strong>';
        edit_btn = '<a href="#activity_notes" data-rel="popup" class="activity_edit_btn ui-btn ui-icon-edit ui-btn-inline ui-btn-icon-notext edit_activity_btn"';
        edit_btn += ' data-recordid="'+id+'">Edit</a>';
        stop_btn = '<a href="#" class="ui-btn ui-btn-inline ui-mini activity_stop_btn" data-recordid="'+id+'">Stop</a>';
        $('#current_activity_records ul').append('<li>' + edit_btn + li_text + stop_btn + '</li>');    
    },
    buildCompletedActivitiesList: function(){
        //acts = app.getCompletedActivities();
        app.getCompletedActivities(function(acts){
            $('#activities_log ul.activities').html('');
            edit_btn = '<a href="#" class="ui-btn ui-icon-edit ui-btn-inline ui-btn-icon-notext edit_activity_btn">Edit</a>';
            rows = acts.rows;
            for (r in rows){
                doc = rows[r].value;
                console.log(doc);
                li = '<li>' + edit_btn + doc.activity_name ;
                li += '<b> start:</b> ' + doc.start_time +  ' <b>end:</b> ' + doc.end_time;
                li += ' [notes] ';
                li += '</li>';
                $('#activities_log ul.activities').append(li);
            }
        });
    },
    buildSightingsList: function(){
        app.getCompletedSightings(function(sites){
            $('#sightings_log ul.sightings').html('');
            /*edit_btn = '<a href="#sighting_detail" data-rel="popup" 
            class="ui-btn ui-shadow ui-corner-all ui-icon-edit ui-btn-icon-left">';*/
            rows = sites.rows;
            for (r in rows){
                doc = rows[r].value;
                //console.log(doc);
                li_tag = $('<li></li>');
                a_tag = $('<a></a>');
                a_tag.attr({href:"#sighting_detail",'data-dbid':doc.id});
                a_tag.addClass("sighting_item ui-btn ui-shadow ui-corner-all ui-icon-eye ui-btn-icon-left");
                //li = '<li>' + edit_btn;
                a_text = '<b>' + moment(doc.start_time).format(app.time_only_format);
                a_text += ' &mdash; ' + moment(doc.end_time).format(app.time_only_format) + '</b>';
                /*if (doc.sighting_notes){
                    a_text += ' ' + doc.sighting_notes.substring(0,14) + '...';
                }*/
                a_text += ' &nbsp; ' + doc.sighting_notes;
                
                a_tag.html(a_text);
                li_tag.append(a_tag);
                //li += doc.id;
                //li += '</a></li>'; 
                $('#sightings_log ul.sightings').append(li_tag);
            }
            $('#sightings_log ul.sightings').listview('refresh'); //jQm re-parse css/js
        });
    },
    buildSightingDetailPg: function(){
        db_id = $(this).attr('data-dbid');
        //console.log(db_id);
        // note: this is a good candidate for templating!
        dBase.find(db_id,function(doc){
            // store this object so it can be updated on submit listener
            app.sighting_currently_editing = doc;
            //build page
            content = '<a href="#" data-rel="back" class="ui-btn ui-btn-b ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>';
            content +=  '<h1>Sighting Detail</h1>';
            content += '<p><b>Date:</b> '+ moment(doc.start_time).format(app.date_only_format) + '<br/><b>DB id:</b> ' + doc._id + '</p>';
            content += '<h4>Start Time</h4><p>';
            content += '<a href="#" class="edit-site-start ui-btn ui-nodisc-icon ui-btn-b ui-corner-all ui-icon-edit ui-btn-icon-notext ui-btn-inline">edit</a> ';
            content += moment(doc.start_time).format(app.time_only_format) + '</p>';
            content += '<div id="site_start_input" class="time_input"> <input id="hr_start" type="number" value="'+ moment(doc.start_time).format('HH')+'"/> : ';
            content += '<input id="min_start" type="number" value="'+ moment(doc.start_time).format('mm')+'"/></div>';
            //type="time" new in html5
            content += '<h4>End Time</h4><p>';
            content += '<a href="#" class="edit-site-end ui-btn ui-nodisc-icon ui-btn-b ui-corner-all ui-icon-edit ui-btn-icon-notext ui-btn-inline">edit</a> ';
            content += moment(doc.end_time).format(app.time_only_format) + '</p>';
            content += '<div id="site_end_input" class="time_input"> <input id="hr_end" type="number" value="'+ moment(doc.end_time).format('HH')+'"/> : ';
            content += '<input id="min_end" type="number" value="'+ moment(doc.end_time).format('mm')+'"/></div>';
            content += '<p><br/></p><h4>Notes</h4> (tap to edit)';
            content += '<p contenteditable="true" class="sighting_notes">';
            content += doc.sighting_notes + '</p>';
            content += '<a href="#" id="update_sighting_btn" class="ui-btn ui-corner-all ui-icon-check ui-btn-inline ui-btn-icon-left">Update</a>';
            $('#sighting_detail').html(content);
            $('#site_start_input, #site_end_input').hide();

            //manually pop up
            $("#sighting_detail").popup("open", {
                "transition": "pop"
            });
        }); 

    },

    // Database
    saveActivity: function(activityObj,callback){
        activityObj.objtype = 'activity';
        // if this is an existing activity
        if (activityObj._id && activityObj._rev){
            dBase.update(activityObj,activityObj._id,activityObj._rev,function(results){
                activityObj._rev = results.rev;
            });
        } else {
            dBase.add(activityObj,function(results){
                activityObj._id = results.id;
                callback();
            });
        }   
    },
    saveSighting: function(sightingObj,callback){
        sightingObj.objtype = 'sighting';
        // if this is an existing sighting
        if(sightingObj._id && sightingObj._rev){
            dBase.update(sightingObj,sightingObj._id,sightingObj._rev,function(results){
                sightingObj._rev = results.rev;
                callback();
            });

        } else {
           dBase.add(sightingObj,function(results){
                sightingObj._id = results.id;
                callback();
            }); 
        }
        
    },
    couchSync: function(){
        dBase.sync();
    },

    // Helpers
    debug: function(log){
        $('#msg').append(log + "<br/>");
    },
    // use native alert when available
    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },
    // use native confirm when available
    showConfirm: function (message) {
        if (navigator.notification) {
            return navigator.notification.confirm(message);
        } else {
            return confirm(message);
        }
    },
    debugLocalDb: function(){
        dBase.all(function(results){
            for (r in results){
                console.log(results[r]);
            }
         });
    },
    testDb: function(){
        app.my_obj = {a:123,b:543543};
        /*dBase.add(app.my_obj,function(results){
            //console.log(results);
            app.my_obj.db_id = results.id;
            //my_obj.db_rev = results.rev;
            
        });*/
        app.saveActivity(app.my_obj);  
    },
    resetDB: function(){
        alert('db reset');
        dBase.db.destroy('zambia');
        dBase.db = PouchDB('zambia');
    }
};

/*
TODO: 
- list of activities should be clickable, so you can stop/edit activity
- activity record detail modal or page (like sightings)
- show current activities on top bar or in pull-down, modal, etc
- maybe a top left corner drop-down to easily get to diff sections/ to show current activitiess/sightings
- IMPORTANT: get lists of activities from outside DB and/or config file


x add sightings to pouchDB (like with activities)
x make update button work on sightings detail page. add close or cancel btn

*/
