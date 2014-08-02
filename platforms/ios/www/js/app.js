angular.module('zapp', ['ngRoute','ionic','pouchdb','zapp.controllers','zapp.services','zapp.filters','zapp.directives'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
// ==== ROUTES ==== //
.config(function ($urlRouterProvider,$stateProvider) {
	
	$stateProvider
	.state('home',{
		url: '/',
	    controller: 'MainController',
	    //template: '<p>Home</p>'
	    templateUrl:'templates/dashboard_partial.html'   
	})
	.state('observer_activity',{ //the base for observer activity form
		url: '/observer_activity/:oaid',
		//abstract: true,
		controller: 'ObserverActivityController',
        templateUrl: 'templates/obs_activity_detail.html',
        //templateUrl: 'templates/timeable_record.html',
		resolve:{"observerActivityFactory":"observerActivityFactory"}
	})
	.state('activity_records',{ //list of all obs act records
		url: '/activity_records/:getby',
		controller: 'ObserverActivityCollectionController',
        templateUrl: 'templates/list_of_editables.html',
        resolve:{"pouchDbFactory":"pouchDbFactory"}
	})
	.state('sightings',{
		url: '/sightings/:getby',
		controller: 'SightingCollectionController',
        templateUrl: 'templates/list_of_editables.html',
        resolve:{"pouchDbFactory":"pouchDbFactory"}
	})
	.state('sighting',{
		url: '/sighting/:sid',
		controller: 'SightingController',
        templateUrl: 'templates/sighting_detail.html',
        resolve:{"sightingFactory":"sightingFactory"}
	})
	.state('settings',{
		url: '/settings',
		controller: 'SettingsController',
		templateUrl: 'templates/settings.html'
	})
	.state('location',{ //location settings -- could be a sub page/route of settings pg
		url: '/location',
		templateUrl: 'templates/location.html'
	})
	/*.state('database',{
		url: '/database',
		templateUrl: 'templates/database.html'
	})*/
	/*.state('bluetooth',{
		url: '/bluetooth',
		
		controller: 'BluetoothController',
		templateUrl: 'templates/bluetooth.html'
		//resolve:{"observerActivityFactory":"observerActivityFactory"}
		
	})*/;
	
	$urlRouterProvider.otherwise("/");
});

