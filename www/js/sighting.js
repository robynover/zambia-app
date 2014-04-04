/* structure of sighting object

        {
            start_time: app.start_time,
            end_time: app.end_time,
            sighting_notes: '',
            phenotype_sightings: [ { 
            						phenotype_id: 0,
						            phenotype_name: "",
						            phenotype_notes: "",
						            frequency: 0.0
						            }
								],


            census_animals: []
        }

*/


var Sighting = function(){
	this.sighting_id = null;
	this.start_time = '';
    this.end_time = '';
    this.sighting_notes = '';
    this.phenotype_sightings =[];
};