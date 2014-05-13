var studyData = {
	// TODO check to see if there are any values stored in local storage first

	//default values
	//all_activities: {1:'Sleeping',2:'Searching for groups',3:'Driving',4:'Trapping'},
  all_activities: [
    'Traveling by vehicle',
    'Surveying in vehicle',
    'Surveying on foot',
    'Searching/tracking in vehicle',
    'Searching/tracking on foot',
    'Observing',
    'Captures: darting',
    'Captures: trapping',
    'Captures: processing',
    'Camp: personal',
    'Camp: cooking',
    'Camp: labwork',
    'Camp: data entry'
  ],
  all_activities_test: {
    'Traveling':[],
    'Surveying':['vehicle','foot'],
    'Searching/tracking':['vehicle','foot'],
    'Observing':[],
    'Captures':['darting','trapping','processing'],
    'Camp':['personal','cooking','labwork','data entry']
  },

	all_phenotypes: {1:'light muzzle',2:'mohawk',3:'small pink swelling'}


}

/*
Sighting data example (json from couch):
{
  "sighting_id": 148,
  "start_time": "2014-04-14 15:39:16.934-04",
  "end_time": "2014-04-14 15:40:36.831-04",
  "sighting_notes": "What I saw on Monday. ",
  "census_animals": [],
  "sighting_phenotypes": [
    {
      "phenotype_id": 2,
      "phenotype_name": "mohawk",
      "phenotype_notes": null,
      "frequency": null
    },
    {
      "phenotype_id": 3,
      "phenotype_name": "small pink swelling",
      "phenotype_notes": null,
      "frequency": null
    }
  ],
  "all_phenotypes": null,
  "_id": "3E82D807-34F1-422B-BE67-08373AADADAE",
  "_rev": "1-a71efa39ecb6ebf878a58c8d4da1ba2b"
}
*/
/*
Observer Activity data example:
{
	_id: "3F000C00-2DE6-4590-B5EC-45449C28D6C0", 
	_rev: "3-67374010e707c33f5b1f316b28836571", 
	activity_name: "Driving", 
	activity_id: "3", 
	start_time: "2014-04-15 23:55:20.721 -0400", 
	objtype: "activity", 
	activity_notes: "Driving around for a while", 
	end_time: "2014-04-15 23:59:12.195 -0400"
}


*/