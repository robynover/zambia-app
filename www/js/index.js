var app = {
    // properties
    sighting_clock_running: false,
    obs_activity_clock_running: false,
    current_sighting: {phenotype_sightings:[]},
    sighting_notes: '',
    current_obs_activities: [],
    timestamp_format: "YYYY-MM-DD HH:mm:ss.SSS ZZ", // for momentJS library
    time_only_format: "HH:mm:ss",
    activity_listening: false,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.onDeviceReady(); //for browser debugging
        app.debug('init');
        //console.log('init');
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('#obs_activity_list > li').bind('click',this.obsActivitySelectListener);
        $('#sighting_time').bind('click',this.trackSightingTime);
        $('#new_act_btn').bind('click',this.newObsActivityListener); 
        $('#add_pheno_btn').bind('click',this.makePhenotypeSelect);
        $( window ).on( "pagechange",this.pageChangeListener);
        //$('#activity_notes_done_btn').bind('click', this.addActivityNotes);
        $('#save_pheno_obs').bind('click',this.savePhenotypeSighting);
        $('#phenotype_select').bind('change',this.phenoSelectListener);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        app.debug('device ready');
    },
    // Listeners
    obsActivitySelectListener: function(){
        activity_name = $(this).text();
        activity_id = $(this).attr('data-actid');
        is_ready = app.showConfirm('Start '+ activity_name + '?');
        if (is_ready){
            start_activity = true;
            // add to array
            activity_id = $(this).attr('data-actid');
            activity_name = $(this).text();
            actObj = {};
            actObj.activity_id = activity_id;
            actObj.activity_name = activity_name;
            app.current_obs_activities.push(actObj);
            index = app.current_obs_activities.length - 1;

            // start activity timer
            trackedObj = app.trackObserverActivityTime(index);

            // UI
            //$('#obs_activity_list, #activity_title').fadeOut();
            //$('#status_bar').text('Activity: '+ activity_name);
            $('#activity_records').show();
            //$('#activity_records ul').append('<li>' + activity_name + '</li>');
            //li_text = activity_name + ', started at <strong>' + moment().format(app.time_only_format) + '</strong>';
            //$('#activity_records ul').append('<li>' + li_text + '</li>');
            app.addActivityRecordLi(activity_name,index,trackedObj.start_time);

            //$('#obs_activity_list').fadeOut();
        } else {
            console.log('NOT ready to start');
        }
        
    },
    newObsActivityListener: function(){
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
        $('#activity_records').show();
        //app.addActivityRecordLi(activity_name,activity_id,trackedObj.start_time);
        app.addActivityRecordLi(activity_name,index,trackedObj.start_time);

        //add new activity to selection list
        // remove last child class and add new last child
        $('#obs_activity_list li:last-child').removeClass('ui-last-child');
        $('#obs_activity_list').append('<li class="ui-last-child" data-actid="'+activity_id+'"><a class="ui-btn" href="#">'+activity_name+'</a></li>');

        //add to master list of activities
        studyData.all_activities[activity_id] = activity_name;
    },
    stopActivityBtnListener:function(){
        //console.log('stop activity click');
        record_id = $(this).attr('data-recordid');
        confirmed = app.showConfirm('Stop '+ app.current_obs_activities[record_id].activity_name + '?');
        if (confirmed){
            trackedObj = app.trackObserverActivityTime(record_id);
            //app.showAlert('activity stopped: ' + trackedObj.activity_name);

            //store to local DB
            app.saveActivity(trackedObj);

            //console.log(trackedObj);
            //changed to show stopped 
            //console.log($(this).parent());
            el = $(this).parent();
            $(this).remove();
            el.append(' Stopped at <b>'+ moment(trackedObj.end_time).format(app.time_only_format) + '</b>');
            el.addClass('stopped');
            el.fadeOut(3000);
        }
        
    },
    pageChangeListener: function(){
        if (location.hash == '#activities_log'){
            app.buildCompletedActivitiesList();
        }
    },
    showActivityNotes: function(){
        record_id = $(this).attr('data-recordid');
        $('#activity_notes').attr('data-recordid',record_id);
        $('#activity_notes').show();
    },
    addActivityNotes: function(){
        id = $('#activity_notes').attr('data-recordid');
        app.current_obs_activities[id].activity_notes = $('#activity_notes_field').val();

    },
    savePhenotypeSighting: function(){
        // object structure
        /*obj = { 
            phenotype_id: 0,
            phenotype_name: "",
            phenotype_notes: "",
            frequency: 0.0
        };*/
        //ps.phenotype_id = 0;
        ps = {};
        // is this ia new phenotype
        if ($('#new_phenotype').val().length > 2){
            ps.phenotype_name = $('#new_phenotype').val();
        } else {
            ps.phenotype_id = $('#phenotype_select').val();
            ps.phenotype_name = $('#phenotype_select option:selected').text();
        }
        ps.frequency = $('#frequency_slider').val()/100;
        ps.phenotype_notes = $('#pheno_notes').val();
        app.current_sighting.phenotype_sightings.push(ps);
        
        // add to display list of stored records
        $('#pheno_obs_records').show();
        $('#pheno_obs_records ul').append('<li>' + ps.phenotype_name + ' ' + ps.frequency+'</li>');

        // clear/reset all the values
        $('#frequency_slider').val(50);
        $('#pheno_notes').val('');
        $('#new_phenotype').val('');
        $('#new_phenotype').hide();

        // remove selected phenotype from array -- each can only be used once per sighting
        $('#phenotype_select option:selected').remove();
        console.log(app.current_sighting);

    },
    phenoSelectListener: function(){
        if ($(this).val() == 'new'){
            $('#new_phenotype').show();
        } else {
            $('#new_phenotype').hide();
        }
    },
    // Controllers 
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
        if (app.sighting_clock_running){ //stop time
            app.current_sighting.end_time = moment().format(app.timestamp_format);
            app.sighting_clock_running = false;
            this.innerHTML = 'Start Sighting';
            $('#add_pheno_btn').hide();
            $('#pheno_obs_records').hide();
            $('#sighting_notes_wrap').hide();
            $('#sightings_status_bar').html('Sighting saved.');
            
        } else { //start time
            app.current_sighting.start_time = moment().format(app.timestamp_format);//Date.now();
            app.sighting_clock_running = true;
            this.innerHTML = 'End Sighting';
            
            // UI
            // show sighting started
            //$('#sighting_status').html('Sighting started at <strong>' + moment().format(app.time_only_format) + '</strong>');
            //show sighting notes button
            $('#sighting_notes_wrap').show();
            // show add phenotypes button
            $('#add_pheno_btn').show();
            $('#pheno_obs_records').show();

            // set up phenotype selection menu
            // app.makePhenotypeSelect();

            // open up phenotype entry when timer has started
            //$('#pheno_obs').show();
            $('.sighting_title').hide();
            // hide sync button -- can't sync while timer is running
            //$('#sync_remote').hide();
            // hide records div -- no records yet
            //$('#pheno_obs_records').hide();
        } 
    },
    getCompletedActivities: function(){
        acts = [];
        for (i in app.current_obs_activities){
            if (app.current_obs_activities[i].end_time){
                acts.push(app.current_obs_activities[i]);
            }
        }
        return acts;
    },

    // UI
    makePhenotypeSelect: function(){
        phenos = studyData.all_phenotypes;
        $('#phenotype_select').html('');
        for (p in phenos){
            $('#phenotype_select').append('<option value="'+ p +'">'+ phenos[p] + '</option>');
        }
        $('#phenotype_select').append('<option value="new">New Phenotype</option>'); 
        // to do: add listener to show an input box when "New" is chosen
    },
    addActivityRecordLi: function(activity_name,id,start_time){
        li_text = activity_name + ', started at <strong>' + moment(start_time).format(app.time_only_format) + '</strong>';
        edit_btn = '<a href="#" class="ui-btn ui-icon-edit ui-btn-inline ui-btn-icon-notext edit_activity_btn" data-recordid="'+id+'">Edit</a>';
        stop_btn = '<a href="#" class="ui-btn ui-btn-inline ui-mini activity_stop_btn" data-recordid="'+id+'">Stop</a>';
        $('#activity_records ul').append('<li>' + edit_btn + li_text + stop_btn + '</li>');
        // add listener now that the button/s exist/s, if it hasn't been added already
        //if (!app.activity_listening){
            //app.activity_listening = true;
            $('.activity_stop_btn').bind('click',this.stopActivityBtnListener);
            //$('.edit_activity_btn').bind('click',this.showActivityNotes);
        //}
    },
    buildCompletedActivitiesList: function(){
        acts = app.getCompletedActivities();
        //console.log(acts);
        $('#activities_log ul').html('');
        edit_btn = '<a href="#" class="ui-btn ui-icon-edit ui-btn-inline ui-btn-icon-notext edit_activity_btn">Edit</a>';
        for (id in acts){
            li = '<li>' + edit_btn + acts[id].activity_name ;
            li += '<b> start:</b> ' + acts[id].start_time +  ' <b>end:</b> ' + acts[id].end_time;
            li += ' [notes] ';
            li += '</li>';
            $('#activities_log ul').append(li);
        }
        //$('.edit_activity_btn').bind('click',this.showActivityNotes);
    },
    // Database
    saveActivity: function(activityObj){
        activityObj.objtype = 'activity';
        /*TODO!! Need to be able to update, not just add*/
        dBase.add(activityObj);
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
    }
};

/*
TODO: 
list of activities should be clickable, so you can stop activity
activity record detail modal or page
*/
