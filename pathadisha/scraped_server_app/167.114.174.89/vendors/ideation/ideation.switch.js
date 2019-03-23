
(function() {
  'use strict';
angular.module('ideation-switch',[]);
angular.module('ideation-switch').directive('ideationSwitch', function($timeout){
    return {
      restrict: 'E',
      template: '<style> .chk .active, .chk .inactive {font-size:140px;cursor:pointer;} .chk i.active { color: #4989dc} .chk i.inactive {color: #ccc}</style>' +
                '<div class="chk"><i class="fa fa-toggle-on active" style="font-size:36px !important;"' +
                'ng-if="isEnabled == true" ng-model="isEnabled"></i>' +
                '<i class="fa fa-toggle-on fa-rotate-180 inactive" style="font-size:36px !important;"' +
                'ng-if="isEnabled == false" ng-model="isEnabled"></i></div>',
      scope: {
        isEnabled: '=enabled',
        onCheckChanged: '&'
      },
      link: function(scope, element, attr){
        element.bind('click', function (evt) {
            scope.$apply(function () {
                scope.isEnabled = !scope.isEnabled;
                $timeout(function(){
                    scope.onCheckChanged({arg1: scope.isEnabled});
                }, 100);
            });
        });
      }
    };
  })
})();