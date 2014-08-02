// ==== DIRECTIVES ==== //
angular.module('zapp.directives', [])
.directive('sideMenuNav', function() {
    return {
    	restrict: 'E',
      templateUrl: 'templates/side_menu_nav.html'
    };
  })
// create a <main-header> tag for template (yes, it changes to a hyphen in html)
.directive('mainHeader', function() {
    return {
    	restrict: 'E',
      templateUrl: 'templates/main_header.html'
    };
  })
.directive('recordList', function(){
    return {
        //template : '<div ng-model="member">{{member.name}} <li ng-repeat="child in member.children">{{child.name}}</li></div>',
        templateUrl:'templates/simple_record_list.html',
        replace : false,
        restrict: 'E',
        scope : {
            'record' : '=model'
        },
        link: function(scope, element, attr) {}
    };
})
.directive('zTimeControl',function($filter){
    return {
      restrict: 'EA',
      templateUrl: 'templates/time_control_directive.html',
      require: 'ngModel',
      //replace: true,
      link: function(scope,iElement,iAttrs,ngModelCtrl){
          // $formatters
          // format the raw data (model) to a view you can use
          ngModelCtrl.$formatters.push(function(modelValue){
            // convert timestamp to form-friendly tim
            console.log(modelValue);
            return {
              //friendly:"hello",
              original_date: modelValue.start_time,
              formatted_time: $filter('date')(modelValue.start_time,'HH:mm')
            };
          });
          // $render
          // get data to UI (uses $viewValue)
          ngModelCtrl.$render = function(){
             scope.record.start_time = ngModelCtrl.$viewValue.formatted_time;
             scope.original_date = ngModelCtrl.$viewValue.original_date;
          };
          // $parsers
          // get the UI data back to model data format
          ngModelCtrl.$parsers.push(function(viewValue){
              //TODO:
              // get time from the form (HH:mm)
              // take original date and add it to new time to make timestamp
              // save new timestamp to start_time
          });
          // $watch
          // listen for changes in UI
          //scope.$watch('something',function(){
              // call ngModelCtrl.$setViewValue({a:data})
          //});
        },//end link func
        
        controller: ['$scope', '$filter', function($scope, $filter) {

            // console.log($scope.record);
            // $scope.original_date = $scope.record.start_time;
            // var obj = new Date(parseInt($scope.record.start_time));
            // $scope.start_time = $filter('date')(obj,'HH:mm');

          }],
      }; // end return obj;
    } // end anon func in directive
    );//end directive


/*.directive('zTimeEditPanel',function(){
    return {
      
      templateUrl: 'templates/time_panel_directive.html',
      link: function($scope, element, attrs){
          console.log($scope.timestamp);
          $scope.processTimestamp();
          // action on change of input elements
          element.find('input').bind('change',function(){
              switch (this.id){
                case 'hr':
                  $scope.hr = $scope.zeroPad(this.value);
                  break;
                case 'min':  
                  $scope.min = $scope.zeroPad(this.value);
              }
              // have to use APPLY!!!
              $scope.$apply(makeNewTime);
              
          });
          var makeNewTime = function(){
            // paste together date + hrs + min --> new Date()
            var newDate = new Date($scope.hr+':'+$scope.min + ' ' + $scope.orig_date);
            //console.log('NEW DATE TIME: '+ newDate);
            $scope.timestamp.t = newDate.getTime();
          };
      },
      // funcs which require $filter go here
      controller: function($scope,$filter){
          // get sections of datetime
          $scope.processTimestamp = function(){
            console.log('processTimestamp '+$scope.timestamp.t);
              var myd = new Date(parseInt($scope.timestamp.t));
              $scope.orig_date = $filter('date')(myd,'MM-dd-yyyy');
              $scope.hr = $filter('date')(myd,'HH');
              $scope.min = $filter('date')(myd,'mm');
          };
          $scope.zeroPad = function(num){
            //console.log($filter('zeropad')(num));
            return $filter('zeropad')(num);
          }; 
      }
    };
});*/
/*.directive('mySampleDirective',function(){
  return {
        //restrict: 'EA',
        scope: {
          //city:'@', // uses template value {{example}} but can't change it -- only the controller can 
          // @ is for strings
          customer: '=', //Two-way data binding (by ref?) -- can be objects (must be??)
          //action: '&', //used for functions
          //datasource: '=',
          timestamp: '='
          //hr: '=',
          //min: '='
          
        },
        //require:'^ngModel',
        templateUrl: 'templates/sample_directive_tpl.html',
        link: function ($scope, element, attrs) {
          $scope.parseHrsMins();
          //console.log(attrs.mynameis);
          //element.append('<h1>Yeah!</h1>');
          console.log($scope.timestamp.t);
          //$scope.timestamp.t = 'hi';
          //console.log(element.find('input').attr('id'));
          $scope.changeCustomer();
          element.find('input').bind('change',function(){
              console.log(this.id + '   ' + this.value);
              switch (this.id){
                case 'hr':
                  $scope.hr = $scope.zeroPad(this.value);
                  break;
                case 'min':  
                  $scope.min = $scope.zeroPad(this.value);
              }
              // have to use APPLY!!!
              $scope.$apply(makeNewTime);
              
          });
          var makeNewTime = function(){
            console.log('makeNewTime');
              //console.log('new ' + $scope.hr + ':' + $scope.min);
              var newDate = new Date($scope.hr+':'+$scope.min + ' ' + $scope.orig_date);
              console.log('NEW DATE TIME: '+ newDate);
              $scope.timestamp.t = newDate.getTime();
              //$scope.timestamp.u = 'hi';
              //console.log($scope.timestamp);
          };
          
        },
        controller: function($scope,$filter){

          var myd = new Date(parseInt($scope.timestamp.t));
          $scope.orig_date = $filter('date')(myd,'MM-dd-yyyy');
          
          $scope.parseHrsMins = function(){
              var d = new Date(parseInt($scope.timestamp.t));
              $scope.hr = $filter('date')(d,'HH');
              $scope.min = $filter('date')(d,'mm');
          };
          
          $scope.zeroPad = function(num){
            console.log($filter('zeropad')(num));
            return $filter('zeropad')(num);
          };

          $scope.changeCustomer = function(){
            console.log('change');
            console.log($scope.customer);
            $scope.customer = {
              name: 'Michelle',
              street: '890 Main St.'
            };
          };
        }
      };
});*/
/*.directive('timeKeeper', function(){
  return {
      restrict: 'E',
      templateUrl: 'templates/time_panel.html',
      require: '?ngModel',
      //link:function (scope, elm, attrs, ctrl)
      link: function(scope, element, attrs, ngModel) {
          if(!ngModel){
            console.log('no model');
            return; // do nothing if no ng-model
          } 

          // Specify how UI should be updated
          ngModel.$render = function() {
            //element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
          };

          // Listen for change events to enable binding
          element.on('blur keyup change', function() {
            scope.$apply(read);
          });
          read(); // initialize

          // Write data to the model
          function read() {
            var html = element.html();
            // When we clear the content editable the browser leaves a <br> behind
            // If strip-br attribute is provided then we strip this out
            if( attrs.stripBr && html == '<br>' ) {
              html = '';
            }
            ngModel.$setViewValue(html);
          }
      }
    };
})*/


/*
// example:
// http://stackoverflow.com/questions/14474555/how-to-format-a-date-using-ng-model
// and demo: http://plnkr.co/edit/NzeauIDVHlgeb6qF75hX?p=preview
// the html part being: 
<input id="id{{$index}}" class="datepicker" type="text" 
ng-model="mainScope.myDate" 
mo-date-input="{{dateFormat}}"/>

angModule.directive('moDateInput', function ($window) {
    return {
        require:'^ngModel',
        restrict:'A',
        link:function (scope, elm, attrs, ctrl) {
            var moment = $window.moment;
            var dateFormat = attrs.moMediumDate;
            attrs.$observe('moDateInput', function (newValue) {
                if (dateFormat == newValue || !ctrl.$modelValue) return;
                dateFormat = newValue;
                ctrl.$modelValue = new Date(ctrl.$setViewValue);
            });

            ctrl.$formatters.unshift(function (modelValue) {
                if (!dateFormat || !modelValue) return "";
                var retVal = moment(modelValue).format(dateFormat);
                return retVal;
            });

            ctrl.$parsers.unshift(function (viewValue) {
                var date = moment(viewValue, dateFormat);
                return (date && date.isValid() && date.year() > 1950 ) ? date.toDate() : "";
            });
        }
    };
});



*/

