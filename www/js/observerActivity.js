var observerActivity = {
	all_activities: [],
	current_activities:[],
	startObsActivityRecord: function(){
        activity_name = $(this).text();
        activity_id = $(this).attr('data-actid');
        if (app.showConfirm('Start '+ activity_name + '?')){
            actObj = {};
            actObj.activity_name = activity_name;
            actObj.activity_id = activity_id;
            actObj.start_time = moment().format(app.timestamp_format);
            app.saveActivity(actObj,function(r){
                // UI
                app.addActivityRecordLi(actObj.activity_name,actObj._id,actObj.start_time);
                $('#activity_records').show();
            });
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
    startObsActivityRecord: function(){
        
    },

};