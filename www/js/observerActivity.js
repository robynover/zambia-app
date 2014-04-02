var observerActivity = {
	all_activities: [],
	current_activities:[],
	startObsActivityRecord: function(){
        if (app.showConfirm('Start '+ activity_name + '?')){
            actObj = {};
            actObj.activity_name = $(this).text();
            actObj.activity_id = $(this).attr('data-actid');
            actObj.start_time = moment().format(app.timestamp_format);
            app.saveActivity(actObj);
        }
    },
    endObsActivityRecord: function(id){
        // find the record, do the update
        dBase.find(id,function(doc){
            doc.end_time = moment().format(app.timestamp_format);
            app.saveActivity(doc);
        });
    },
    editObsActivityRecord: function(id){

    },

};