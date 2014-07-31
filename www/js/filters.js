// ==== FILTERS ==== //
angular.module('zapp.filters', [])

// a date filter that accepts a string, not just a Date object
.filter("strtodate", function ($filter) {
    return function (input,param) {
    	return $filter('date')(new Date(input), param);    
    };
})
.filter('zeropad',function(){
	return function(num){
		return (num < 10) ? String('0') + num : num; 
	};
});