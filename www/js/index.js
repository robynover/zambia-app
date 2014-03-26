var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        //this.onDeviceReady(); //for browser debugging
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('#sighting_time').bind('click',this.trackTime);
        $('#save_pheno_obs').bind('click',this.savePhenotypeSighting);
        $('#frequency_input').bind('change',this.frequencySync);
        $('#frequency_slider').bind('change',this.frequencySync);
        $('#phenotype_select').bind('change',this.phenoSelectListener);
        $('#sync_remote').bind('click',this.couchSync);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        //$('#msg').html('ready');
        app.makePhenotypeSelect();
    },
    clock_running: false,
    current_sighting: {phenotype_sightings:[]},
    sighting_notes: '',
    time_format: "YYYY-MM-DD HH:mm:ss.SSS ZZ", // for momentJS library

    // listen for GPS
    gpsListener: function(){
        // get coords
        coords = {gps: true, lat: 40.730473, long: -73.994844, timestamp: Date.now() };
        // store to DB
        dBase.add(coords);
    },
    trackTime: function(){
        if (app.clock_running){ //stop time
            app.current_sighting.time_end = moment().format(app.time_format);
            app.clock_running = false;
            this.innerHTML = 'Start Time';
            $('#timer_status').addClass('off');
            $('#timer_status').html('Timer stopped');

            app.current_sighting.sighting_notes = $('#sighting_notes').val();
            //console.log(app.current_sighting);
            // show sync button
            $('#sync_remote').show();
            
        } else { //start time
            app.current_sighting.time_start = moment().format(app.time_format);//Date.now();
            //$('#msg').append(app.current_sighting.time_start);
            app.clock_running = true;
            this.innerHTML = 'End Time';
            $('#timer_status').addClass('on');
            $('#timer_status').html('Timer running');
            // open up phenotype entry when timer has started
            $('#pheno_obs').show();
            // hide sync button -- can't sync while timer is running
            $('#sync_remote').hide();
        } 
    },
    saveSighting: function(){
        // store to local db
        /*
        // structure of sighting object
        obj = {
            time_start: app.time_start,
            time_end: app.time_end,
            sighting_notes: '',
            phenotype_sightings: [],
            census_animals: []
        };*/
        dBase.add(app.current_sighting);
    },
    getPhenotypes: function(){
        //mocked up for now
        return {1:'light muzzle',2:'mohawk',3:'small pink swelling'};
        //return ['light muzzle','mohawk','small pink swelling'];
    },
    makePhenotypeSelect: function(){
        phenos = app.getPhenotypes();
        for (p in phenos){
            $('#phenotype_select').append('<option value="'+ p +'">'+ phenos[p] + '</option>');
        }
        $('#phenotype_select').append('<option value="new">New Phenotype</option>'); 
        // to do: add listener to show an input box when "New" is chosen
    },
    phenoSelectListener: function(){
        if ($(this).val() == 'new'){
            $('#new_phenotype').show();
        } else {
            $('#new_phenotype').hide();
        }
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
        ps.frequency = $('#frequency_input').val()/100;
        ps.phenotype_notes = $('#pheno_notes').val();
        app.current_sighting.phenotype_sightings.push(ps);
        
        // add to display list of stored records
        $('#pheno_obs_records ul').append('<li>' + ps.phenotype_name + ' ' + ps.frequency+'</li>');

        // clear/reset all the values
        $('#frequency_input').val(50);
        $('#frequency_slider').val(50);
        $('#pheno_notes').val('');
        $('#new_phenotype').val('');
        $('#new_phenotype').hide();

        // remove selected phenotype from array -- each can only be used once per sighting
        $('#phenotype_select option:selected').remove();
        console.log(app.current_sighting);

    },
    // sync the frequency slider value with the frequency input box value when either changes
    frequencySync: function(){
        if ($(this).attr('id') == 'frequency_input'){ 
            $('#frequency_slider').val($(this).val());
        } else if ($(this).attr('id') == 'frequency_slider'){
            $('#frequency_input').val($(this).val());
        }
        //console.log ("INPUT: "+ $('#frequency_input').val());
        //console.log ("SLIDER: "+ $('#frequency_slider').val());
    },
    couchSync: function(){
        dBase.sync();
    },
    debug: function(log){
        $('#msg').append(log + "<br/>");
    }

    /*
    set-up procedure: 
        get list of activities from central database - before 1st use and periodically, 
            depending on whether others are using app
        one-time step: get agesex options from db -- specific to a particular study
        get list of phenotypes (periodic update?)

        should there be a special couchDB db for set-up parameters to run on start-up?

    notes:
    pg time format is: 2014-03-24 15:57:25.377317+00
    */

};

