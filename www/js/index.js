var app = {
    // properties
    current_sighting: {}, // the sighting happening now
    sighting_currently_editing: {}, // a sighting that's being updated
    activity_currently_editing: {},
    all_activities:[], //master list of all available activities, updated as new activities are added on the fly
    timestamp_format: "YYYY-MM-DD HH:mm:ss.SSS ZZ", // for momentJS library
    time_only_format: "HH:mm",
    date_only_format: "YYYY-MM-DD",
    all_phenotypes : {}, //initial set of phenotypes
    current_avail_phenotypes: {},// holds the phenotypes available for each sighting
    in_progress: {activities:[],sighting: {} }, // holds the names of objects (n activities or 1 sighting) started but not finished
   
    // Application Constructor
    initialize: function() {
        this.initData();
        this.setUpUI();  
        this.bindEvents();   
    },
    // set up the starting data -- from db or config file
    initData: function(){
        // DATABASE: new PouchDB instance
        dBase.init('myzambia',{
            local: 'http://192.168.1.2:5984/zambia415',
            remote: 'http://ec2-54-84-90-63.compute-1.amazonaws.com:5984/zambia415'
        });
        // APP DATA
        app.all_phenotypes = studyData.all_phenotypes; //initialize the starting set of phenotypes
        app.current_avail_phenotypes = studyData.all_phenotypes; // holds the phenotypes available for current sighting 
        app.current_sighting.sighting_phenotypes = []; // set datatype of property to Array
        app.all_activities = studyData.all_activities; //initialize the starting set of available activities
    },
    // Bind Event Listeners
    bindEvents: function() {
        /*if (navigator.userAgent.match(/(Mozilla)/)){ // this is in browser, we'll assume (for debugging)
            console.log('browser');
            $(document).ready(this.onDeviceReady());                 
        } else {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        } */  
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // when activity is chosen from list
        $('#obs_activity_list').on('click','li',this.startObsActivityListener);
        // "new activity" button in activity list
        $('#new_act_btn').bind('click',this.newActivityListener);

        $('#sighting_time').bind('click',this.trackSightingTime);
         
        $('#add_pheno_btn').bind('click',this.makePhenotypeSelect);
        $( window ).on( "pagechange",this.pageChangeListener);
        $('#activity_notes_done_btn').bind('click', this.addActivityNotes);
        //$('#pheno_obs').on('click','#save_pheno_obs',this.savePhenotypeToSighting);
        $('#pheno_obs').on('click','#save_pheno_obs',this.addPhenotypeListener);
        $('#pheno_obs').on('change','#phenotype_select',this.phenoSelectListener);

        // Note: use .on() instead of .bind() to apply to elements added dynamically later
        $('#current_activity_records').on('click','.activity_edit_btn',function(){ //todo: save to named function
            //attach record id to activity notes form
            rid = $(this).attr('data-recordid');
            $('#activity_notes').attr('data-recordid',rid);
            dBase.find(rid,function(doc){
                $('#activity_notes_field').val(doc.activity_notes);
            });
        });
        $('ul.activities').on('click','.activity_item',app.buildActivityDetailPg);
        $('#current_activity_records').on('click','.activity_stop_btn',app.stopActivityBtnListener);
        $('#activity_detail').on('click','.edit_activity_start',function(){$('#activity_start_input').toggle()});
        $('#activity_detail').on('click','.edit_activity_end',function(){$('#activity_end_input').toggle()});
        // ******TODO!! need funct to update whole actvity, not just the notes
        $('#activity_detail').on('click','#update_activity_btn',this.updateObsActivityListener);
         
        //sightings
        $('ul.sightings').on('click','.sighting_item',app.buildSightingDetailPg);
        $('#sighting_detail').on('click','.edit_sighting_start',function(){$('#sighting_start_input').toggle()});
        $('#sighting_detail').on('click','.edit_sighting_end',function(){$('#sighting_end_input').toggle()});
        $('#sighting_detail').on('click','#update_sighting_btn',this.updateSightingListener);
     
        // debug
         $('#reset').bind('click',this.resetDB);
         $('#sync_btn').bind('click',this.syncDebug);


         //geolocation
         //var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { frequency: 3000 });
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        alert('device ready');
        //app.debug('device ready');
        // set size of pop-ups
        $('#new_activity,#pheno_obs,#sighting_detail,#activity_detail').css({
                                'min-width':$(window).width() * .75,
                                'min-height':$(window).height() * .75,
                                'padding':'1em'
                            });   

        // build sightings log list -- this may be attached to a diff event later
        app.buildSightingsList(); 
         //debug
         //console.log(dBase);
         //app.showDebugRecords();

    },
    setUpUI: function(){
        /* -- templates -- */
        // attach headers template
        _header_tpl = Handlebars.compile($('#header_tpl').html());
        $('[data-role="header"]').html(_header_tpl());
        // menus
        _activites_menu_tpl = Handlebars.compile($('#activities_menu_tpl').html()); //local var bc content is not dynamic
        // could/should be dynamic in future. building menus on 2 pages separately to set ui-active
        $('#activity .activities_menu').html(_activites_menu_tpl({current:'ui-btn-active',completed:''}));
        $('#activity_log .activities_menu').html(_activites_menu_tpl({current:'',completed:'ui-btn-active'}));

        _sightings_menu_tpl = Handlebars.compile($('#sightings_menu_tpl').html());
        $('#sightings .sightings_menu').html(_sightings_menu_tpl({current:'ui-btn-active',completed:''}));
        $('#sightings_log .sightings_menu').html(_sightings_menu_tpl({current:'',completed:'ui-btn-active'}));

        //compile templates for later use with dynamic data
        app.sighting_detail_tpl = Handlebars.compile($("#sighting_detail_tpl").html());
        app.activity_detail_tpl = Handlebars.compile($("#activity_detail_tpl").html());
        
        // initial list of activity choices
        app.buildAllActivitiesList();

        // show in-progress activities (from db)
        app.buildActiviesInProgressList();     
    },
    
    // ---------- Listeners -------- //
    pageChangeListener: function(){
        // indicate current page in main nav bar
        current_pg = ($( ".ui-page-active").attr('id'));
        //console.log($( ".main_nav ul li a" ));
        $('.main_nav ul li a').removeClass("ui-btn-active");
        $( '#'+current_pg+' .main_nav ul li a' ).each(function() {
            if ($(this).attr('href') == '#'+current_pg || '#'+current_pg.substring(0,current_pg.indexOf('_')) == $(this).attr('href')){
                // add class
                $(this).addClass("ui-btn-active");
            } 
        }); // TODO: account for sub-pages

        if (location.hash == '#activity_log'){
            app.buildCompletedActivitiesList();
        }
        if (location.hash == '#sightings_log'){
            //$('[data-role="content"]').trigger('create');
           // $('#sighting_detail').trigger('pagecreate');
            console.log('hash sightings_log');
            //$( "#sighting_detail" ).popup();
        }

        // refresh jQm UI elements
        //$('[data-role="listview"]').listview();

    },
    /* listener for creating a new record of an existing activity type */
    startObsActivityListener: function(){
        // get the values and pass them out of the listener asap
        obj = {}; 
        obj.activity_name = $(this).text();
        obj.activity_id = $(this).attr('data-actid');
        app.confirmStartObsActivity(obj);
    },
    /* listener for creating a new type of activity */
    newActivityListener: function(){
        // new activity name from input element
        activity_name = $('#new_activity_field').val();
        // make temporary id, using text for uniqueness instead of number
        activity_id = 'temp_id_' + activity_name; 
         
        // --- step 1: deal with the new type of activity
        // store the new activity name/id (key/value) to master array of all activities (in property -- not DB)
        // not needed by NoSQL database bc activities are stored as part of obs-activity records
        // BUT it should be stored in DB so it's remembered on refresh. 

        app.all_activities[activity_id] = activity_name;

        // in UI, add new activity to the list of activity options
        // remove last child class and add last child class to new element
        $('#obs_activity_list li:last-child').removeClass('ui-last-child');
        li = '<li class="ui-last-child" data-actid="'+activity_id+'">';
        li += '<a href="#" class="ui-btn ui-icon-plus ui-btn-icon-left ui-shadow">'+activity_name+'</a></li>';
        $('#obs_activity_list').append(li);
        
        // --- step 2: add the instance of this activity
        // add the new record of this activity w/ start time to DB
        obsActRecordObj = {};
        obsActRecordObj.activity_id = activity_id;
        obsActRecordObj.activity_name = activity_name;
        // add start time
        obsActRecordObj.start_time = moment().format(app.timestamp_format);
        // send it to general add new obs act func
        app.addNewObsActivity(obsActRecordObj);
    },
    stopActivityBtnListener:function(){
        //console.log('stop');
        record_id = $(this).attr('data-recordid');
        //console.log(record_id);
        var this_btn = $(this); //stop_btn
        //console.log('stop activity click '+record_id);
        dBase.find(record_id,function(doc){
            if (app.showConfirm('Stop '+ doc.activity_name + '?')){
                app.endObsActivityRecord(doc,function(){
                    //UI
                    el = this_btn.parent();
                    el.append(' Stopped at <b>'+ moment().format(app.time_only_format) + '</b>');
                    el.addClass('stopped');
                    el.fadeOut(3000,function(){this_btn.remove()});
                    $('.status_bar').html('Observer Activity Stopped');
                });    
            }
        });     
    },
    
    phenoSelectListener: function(){
        if ($(this).val() == 'new'){
            $('#new_phenotype').show();
        } else {
            $('#new_phenotype').hide();
        }
    },
    updateObsActivityListener: function(){
        console.log('update oa listener');
        // using app.activity_currently_editing property so all the stored info doesn't have to go thru the form
        // get values from form
        app.activity_currently_editing.activity_notes = $('#activity_detail > p.activity_notes').text();
        updated_start_time = $('#activity_detail input#hr_start').val() + ':'+$('#activity_detail input#min_start').val();
        updated_end_time = $('#activity_detail input#hr_end').val() + ':'+$('#activity_detail input#min_end').val();
        // get the day part of the date back out
        day = $('#oa_day_only_date').val();
        app.activity_currently_editing.start_time = moment(day + ' ' + updated_start_time).format(app.timestamp_format);
        app.activity_currently_editing.end_time = moment(day + ' ' + updated_end_time).format(app.timestamp_format);
        
        app.saveObsActivity(app.activity_currently_editing, function(){
             $('.status_bar').html('Observer Activity Updated');
             $("#activity_detail").popup("close", {"transition": "pop"});
             app.buildCompletedActivitiesList();
        });
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
    addPhenotypeListener: function(){
        app.savePhenotypeToSighting(function(){
            //close the popup
            console.log('close!');
            $("#pheno_obs").popup("close", {"transition": "pop"});
        });
    },
    // ------- / end listeners ----------

    confirmStartObsActivity: function(obj){ //an obsAct obj has: start,end,activity
        // object should have activity name and activity id
        // if confirmed, set the time and store it
        if (app.showConfirm('Start '+ obj.activity_name + '?')){
            //set the start time for this obj
            obj.start_time = moment().format(app.timestamp_format);
            // send it to general add new obs act func
            app.addNewObsActivity(obj);
        }
    },
    addNewObsActivity: function(obj){
        // save it. 
        app.saveObsActivity(obj,function(r){
            // show it in the list of currently running activities
            app.addActivityRecordLi(obj.activity_name,obj._id,obj.start_time);
            // show message in status bar
            $('.status_bar').html('Observer Activity Started');
        });
    },
    endObsActivityRecord: function(id,callback){ // can take an existing doc object or an id number to find the doc
        if ((typeof id == "object" ) && (id !== null)){
            doc = id;
            doc.end_time = moment().format(app.timestamp_format);
            app.saveObsActivity(doc,function(){console.log('endObsActivityRecord')});
            callback();
        } else {
            // find the record, do the update
            dBase.find(id,function(doc){
                doc.end_time = moment().format(app.timestamp_format);
                app.saveObsActivity(doc, function(){console.log('endObsActivityRecord')});
                callback();
            });
        }        
    },
    updateObsActivityNotes: function(id,notes){ /* redundant. could be worked into another function. keeping for now. */
        dBase.find(id,function(doc){
            doc.activity_notes = notes;
            app.saveObsActivity(doc,function(){});
            $('.status_bar').html('Observer Activity Notes Updated');
        });
    },
    savePhenotypeToSighting: function(callback){
        /* phenotype object structure
        { 
            phenotype_id: 0,
            phenotype_name: "",
            phenotype_notes: "",
            frequency: 0.0
        };*/
        ps = {}; //new phenotype object
        // is this a new phenotype?
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
        app.current_sighting.sighting_phenotypes.push(ps);
        
        // UI
        // add to the display list of stored records
        //$('#pheno_obs_records').show();
        //console.log('added phenotype for sighting: '+ps.phenotype_name);
        $('#pheno_obs_records ul').append('<li>' + ps.phenotype_name + ' ' + ps.frequency+'</li>'); 
        $('#pheno_obs_records ul').listview('refresh'); // for jQm formatting

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
        $('#phenotype_select').selectmenu('refresh');

        // remove selected phenotype from option list -- each can only be used once per sighting
        $('#phenotype_select option:selected').remove();

        callback();       
    },
    trackSightingTime: function(){
        if (app.current_sighting.start_time){ //STOP time if it's been started
            app.current_sighting.end_time = moment().format(app.timestamp_format);
            app.current_sighting.sighting_notes = $('#sighting_notes').val();

            // ---- Save it.------ //
            app.saveSighting(app.current_sighting,function(){
                // make a new empty object for the next sighting
                app.current_sighting = {};
                app.current_sighting.sighting_phenotypes = []; // empty array for phenotypes for this sighting
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
            $('.status_bar').html('Sighting saved.');
          
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
            $('.status_bar').html('Sighting in Progress');
            $(this).html('End Sighting');
            $(this).attr('data-icon','minus');
            $(this).addClass('ui-icon-minus');
            $(this).removeClass('ui-icon-plus');
            
            // show sighting started
            //$('.status_bar').html('Sighting started at <strong>' + moment().format(app.time_only_format) + '</strong>');
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
    showActivityNotes: function(){
        record_id = $(this).attr('data-recordid');
        dBase.find(record_id,function(doc){
            $('#activity_notes_field').val(doc.activity_notes);
        });
        $('#activity_notes').attr('data-recordid',record_id);
        $('#activity_notes').show();
    },
    addActivityNotes: function(){
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
        li_text = '<a href="#activity_notes" data-rel="popup" class="activity_edit_btn activity_edit_text ui-btn ui-btn-inline" ';
        li_text += ' data-recordid="'+id+'">';
        li_text += activity_name + ', started at <strong>' + moment(start_time).format(app.time_only_format) + '</strong></a>';
        edit_link = '<a href="#activity_notes" data-rel="popup" class="activity_edit_btn  ui-btn ui-icon-edit ui-btn-inline ui-btn-icon-notext ui-corner-all" ';
        edit_link += ' data-recordid="'+id+'">';
        edit_btn = edit_link + 'Edit</a>';

        stop_btn = ' <a href="#" class="activity_stop_btn ui-btn ui-btn-inline ui-btn-icon-left ui-corner-all ui-icon-minus ui-mini" data-recordid="'+id+'">Stop</a>';
        $('#current_activity_records ul').append('<li>' + edit_btn + li_text + stop_btn + '</li>'); 
        //$('#current_activity_records ul').append('<li><a href="#" class="ui-icon-edit">'+ li_text +'</a><a href="#" class="ui-icon-edit">stop</a></li>'); 
    },
    buildCompletedActivitiesList: function(){
        //acts = app.getCompletedActivities();
        app.getCompletedActivities(function(acts){
            $('#activity_log ul.activities').html('');
            //edit_btn = '<a href="#" class="ui-btn ui-icon-edit ui-btn-inline ui-btn-icon-notext activity_edit_btn">Edit</a>';
            rows = acts.rows;
            for (r in rows){
                doc = rows[r].value;
                //console.log(doc);
                li_tag = $('<li></li>');
                a_tag = $('<a></a>');
                a_tag.attr({href:"#activity_detail",'data-dbid':doc.id});
                a_tag.addClass("activity_item ui-btn ui-shadow ui-corner-all ui-icon-edit ui-btn-icon-left");
                a_text = '<b>' + moment(doc.start_time).format(app.time_only_format);
                a_text += ' &mdash; ' + moment(doc.end_time).format(app.time_only_format);
                a_text += ', ' + doc.activity_name +'</b>';
                if (doc.activity_notes){
                    a_text += ' &nbsp; ' + doc.activity_notes;
                } else {
                    a_text += ' &nbsp; No notes';
                }
                
                a_tag.html(a_text);
                li_tag.append(a_tag);
                $('#activity_log ul.activities').append(li_tag);
            }
            $('#activity_log ul.activities').listview('refresh'); //jQm re-parse css/js
        });
    },
    buildActiviesInProgressList: function(){
        app.getActivitiesInProgress(function(acts){
            rows = acts.rows;
            for (r in rows){
                doc = rows[r].value;
                //console.log(doc);
                app.addActivityRecordLi(doc.activity_name,doc.id,doc.start_time);
            }
            ct = rows.length;
            $('.status_bar').html( '<b>'+ct + '</b> Activities in Progress');
        });
    },
    buildAllActivitiesList:function(){
        // <li data-actid="1"><a href="#" class="ui-btn ui-icon-plus ui-btn-icon-left ui-shadow">Sleeping</a></li>
        $('#obs_activity_list').html('');
        for (a in app.all_activities){
            li = '<li data-actid="'+ a + '">';
            li += '<a href="#" class="ui-btn ui-icon-plus ui-btn-icon-left ui-shadow">';
            li += app.all_activities[a] + '</a></li>';
            $('#obs_activity_list').append(li);
        }
    },
    buildSightingsList: function(){
        app.getCompletedSightings(function(sightings){
            console.log(sightings);
            $('#sightings_log ul.sightings').html('');
            /*edit_btn = '<a href="#sighting_detail" data-rel="popup" 
            class="ui-btn ui-shadow ui-corner-all ui-icon-edit ui-btn-icon-left">';*/
            rows = sightings.rows;
            for (r in rows){
                doc = rows[r].value;
                //console.log(doc);
                li_tag = $('<li></li>');
                a_tag = $('<a></a>');
                a_tag.attr({href:"#sighting_detail",'data-dbid':doc.id});
                a_tag.addClass("sighting_item ui-btn ui-shadow ui-corner-all ui-icon-edit ui-btn-icon-left");
                //li = '<li>' + edit_btn;
                a_text = '<b>' + moment(doc.start_time).format(app.time_only_format);
                a_text += ' &mdash; ' + moment(doc.end_time).format(app.time_only_format) + '</b>';
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
        console.log('s detail');
        db_id = $(this).attr('data-dbid');
        dBase.find(db_id,function(doc){
            // store this object so it can be updated on submit listener
            app.sighting_currently_editing = doc;
            //use template
            context_obj = {
                day: moment(doc.start_time).format(app.date_only_format),
                dbid: doc._id,
                start_time: moment(doc.start_time).format(app.time_only_format),
                hr_start: moment(doc.start_time).format('HH'),
                min_start: moment(doc.start_time).format('mm'),
                end_time: moment(doc.end_time).format(app.time_only_format),
                hr_end: moment(doc.end_time).format('HH'),
                min_end: moment(doc.end_time).format('mm'),
                sighting_notes: doc.sighting_notes
            };

            content = app.sighting_detail_tpl(context_obj);
            //console.log('b___'+content);
            $('#sighting_detail').html(content);

            
            /*$( "#sighting_detail" ).popup({
                create: function( event, ui ) {console.log('pop')},
                beforeposition: function( event, ui ) {console.log('bp pop');}
            });*/
            //$('section').trigger('pagecreate');
            $('#sighting_start_input, #sighting_end_input').hide();
            
            //manually pop up
            $("#sighting_detail").popup("open", {
                "transition": "pop"
            });
            
        }); 
    },
    buildActivityDetailPg: function(){
        db_id = $(this).attr('data-dbid');
        dBase.find(db_id,function(doc){
            // store this object so it can be updated on submit listener
            app.activity_currently_editing = doc;
            //use template
            context_obj = {
                day: moment(doc.start_time).format(app.date_only_format),
                dbid: doc._id,
                activity_name: doc.activity_name,
                start_time: moment(doc.start_time).format(app.time_only_format),
                hr_start: moment(doc.start_time).format('HH'),
                min_start: moment(doc.start_time).format('mm'),
                end_time: moment(doc.end_time).format(app.time_only_format),
                hr_end: moment(doc.end_time).format('HH'),
                min_end: moment(doc.end_time).format('mm'),
                activity_notes: doc.activity_notes
            };
            content = app.activity_detail_tpl(context_obj);
            $('#activity_detail').html(content);
            $('#activity_start_input, #activity_end_input').hide();
            //manually pop up
            $("#activity_detail").popup("open", {
                "transition": "pop"
            });
        });
    },

    // Database
    saveObsActivity: function(obsActivityObj,callback){
        obsActivityObj.objtype = 'activity';
        // if this is an existing activity
        if (obsActivityObj._id && obsActivityObj._rev){
            dBase.update(obsActivityObj,function(results){
                obsActivityObj._rev = results.rev;
                callback();
            });
        } else { // new record
            dBase.add(obsActivityObj,function(results){
                obsActivityObj._id = results.id;
                callback();
            });
        }   
    },
    saveSighting: function(sightingObj,callback){
        sightingObj.objtype = 'sighting';
        // if this is an existing sighting
        if(sightingObj._id && sightingObj._rev){
            dBase.update(sightingObj,function(results){
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
    getCompletedActivities: function(callback){
        // pouch db map/reduce func: get objects of type 'activity' that have ended
        map = function(doc) {
            if(doc.objtype == 'activity' && doc.end_time) {
             emit(doc.start_time, {activity_name:doc.activity_name,
                            activity_id:doc.activity_id,
                            activity_notes:doc.activity_notes,
                            start_time:doc.start_time,
                            end_time:doc.end_time,
                            id:doc._id
                        });
            }
        };
        dBase.db.query({map: map}, {reduce: false, descending:true}, function(err, response) { 
            //console.log(response);
            //app.debug(JSON.stringify(response));
            callback(response);
        });
    },
    getActivitiesInProgress: function(callback){
        map = function(doc) {
            if(doc.objtype == 'activity' && typeof doc.end_time == 'undefined') {
             emit(doc.start_time, {activity_name:doc.activity_name,
                            activity_id:doc.activity_id,
                            activity_notes:doc.activity_notes,
                            start_time:doc.start_time,
                            id:doc._id
                        });
            }
        };
        dBase.db.query({map: map}, {reduce: false}, function(err, response) { 
            //console.log(response);
            callback(response);
        });
    },
    getCompletedSightings: function(callback){
        map = function(doc) {
            if(doc.objtype == 'sighting' && doc.end_time) {
             emit(doc.start_time, {sighting_id:doc.sighting_id,
                            start_time:doc.start_time,
                            end_time:doc.end_time,
                            sighting_notes: doc.sighting_notes,
                            sighting_phenotypes: doc.sighting_phenotypes,
                            id:doc._id
                            });
            }
        };
        dBase.db.query({map: map}, {reduce: false, descending:true}, function(err, response) { 
            //console.log(response);
            callback(response);
        });
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
    },
    resetDB: function(){
        /*alert('db reset');
        dBase.db.destroy('zambia');
        dBase.db.destroy('mynewmonkeydb');
        dBase.db.destroy('ethorecords');
        dBase.db.destroy('zambiaproject');*/
        //dBase.db = PouchDB('zambia');
    },
    syncDebug: function(){
        //dBase.couchSync(dBase.TO_REMOTE);
        dBase.couchSync(dBase.TO_LOCAL);
    },
    showDebugRecords: function () {
        alert('show');
        app.debug('showing');
        dBase.db.all(function(r){app.debug(JSON.stringify(r))});
    },
};

/*
TODO: 
== priorities ==

- !data! IMPORTANT: get lists of activities from outside DB and/or config file (like w/ sightings) 
            x-- make a buildActivityList func similar to buildSightings...
- make phenotypes editable in "sighting log" section
- show current sightings in progress at start-up (from local db) -- same as activities in progress
- figure out storing procedure for list of activities in DB (addActivity func maybe) and see if you really need to store it in a property
- location gps recording

- ** add census entry to sighting
- (small) -- time inputs. <input type="time" value="14:02"/> will show time picker in whatever format the device is set to, 24 hr or 12 hr

== secondary ==
- should be a way to delete records (?)
- on confirm new activity, show notes field (?)
- separate data by day ... + day summary/history page/s?

== extras, UI enhancements == 
- show current activities on top bar or in pull-down, modal, etc
- maybe a top left corner drop-down to easily get to diff sections/ to show current activitiess/sightings



- in list of current activities, make start time editable ? (in addition to notes) 
        --> combine functions here with functions for displaying activity detail in completed list (buildActivityDetailPg, etc)

== complete ==
x - fixed bug with sighting detail box not popping up
x - FIX BUG with stopping activities that are new to list  ... re-do datahandling for activity lists
x- list of activities should be clickable, so you can stop/edit activity    
x- still TODO:  "update" button action in activity detail popup 
x - activity record detail modal or page (like sightings)

x - format phenotype list under current sighting

x - ** dynamic HEADER!

x add sightings to pouchDB (like with activities)
x make update button work on sightings detail page. add close or cancel btn

x for menus, check that the ui-active highlighting is working
 

*/
