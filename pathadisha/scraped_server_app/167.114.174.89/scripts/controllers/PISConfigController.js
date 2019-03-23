/**
 * Created by Aditya on 09-Mar-17.
 */

var stop_name;
angular.module('controlPanelApp').controller('PISConfigController', PISConfigController);

function PISConfigController(PISManagementService, $timeout, $filter, $scope, $localStorage, $state, MonitoringService, $rootScope) {


    var self = this;
    //scope variable declaration
    self.allStoppages = null;
    self.selectedStoppage = [];
    self.allRadius = [{ "radius": 1000, "ticked": false }, { "radius": 2000, "ticked": false }, { "radius": 3000, "ticked": false }, { "radius": 4000, "ticked": false }, { "radius": 5000, "ticked": false }, { "radius": 6000, "ticked": false }, { "radius": 7000, "ticked": false }, { "radius": 8000, "ticked": false }, { "radius": 9000, "ticked": false }, { "radius": 10000, "ticked": false }];
    self.selectedRadius = [];
    $scope.boardNumber = null;
    $scope.stopRoutes = [];
    $scope.selectedStopRoutes = [];
    $scope.sortByTime = false;
    $scope.msg = '';
    $scope.pageSize = 6;
    //$scope.disableDir = false;
    $scope.isSaving = false;


    loadPISConfig();

    function loadPISConfig() {

        if ($localStorage.selectedDBN != null && $localStorage.selectedDBN.length > 0) {
            console.log('selectedDBN', $localStorage.selectedDBN);
            PISManagementService.getPisConfigDetail($localStorage.selectedDBN).then(
          function (response) {
              console.log('PIS Details', response.data);

              if (response.data != null) {

                  $scope.boardNumber = response.data.displayBoardId;
                  $scope.description = response.data.description;
                  $scope.caption = response.data.displayCaption;

                  $scope.userName = response.data.userName;
                  $scope.updateTime = response.data.updateTime;

                  var config = angular.fromJson(response.data.config);
                  console.log('config', config);

                  $scope.selectedStopId = config.selectedStopId;

                  $scope.sortByTime = config.sortByTime;
                  $scope.pageSize = config.pageSize;

                  setExistingRadius(config.selectedRadius);

                  setExistingRoutes(angular.fromJson(config.selectedRoutes));

                  bindAllStops();
              }
          },
          function (err) {
              console.log(err);
          }
      );

        } else {
            //bindAllStops();
        }

    }

    $scope.loadStopsAsync = function (search) {
        $scope.refresingStop = true;
        console.log('search', search);
        MonitoringService.getMatchingStops(search).then(function (response) {
            self.allStoppages = response.data.data;
            $scope.refresingStop = false;
            console.log("Matching Stops", response.data.data);
        }, function (err) {
            console.log(err);
        });

    }

    function bindAllStops() {
        //if ($localStorage.allStops !== null && $localStorage.allStops.length > 0) {

        //    for (var i = 0; i < $localStorage.allStops.length; i++) {
        //        var obj = $localStorage.allStops[i];
        //        //obj.ticked = false;

        //        if ($scope.selectedStopId != null && $scope.selectedStopId === obj.stopId) {
        //            //obj.ticked = true;
        //            self.selectedStoppage = obj;
        //            loadRoutesByStopId($scope.selectedStopId);
        //            //$scope.disableDir = true;
        //        }
        //    }

        //    self.allStoppages = $localStorage.allStops;

        //}

        MonitoringService.getStopById($scope.selectedStopId).then(function (response) {
            console.log('getStopById', response.data);
            self.selectedStoppage = response.data;
            self.allStoppages = [];
            self.allStoppages.push(angular.copy(self.selectedStoppage));
            loadRoutesByStopId($scope.selectedStopId);
                        //$scope.disableDir = true;
        }, function (err) {
            console.log(err);
        });
    };

    function setExistingRadius(radius) {

        for (var i = 0; i < self.allRadius.length; i++) {
            if (radius !== null && radius === self.allRadius[i].radius) {
                self.allRadius[i].ticked = true;
                self.selectedRadius = self.allRadius[i];
            } else {
                self.allRadius[i].ticked = false;
            }

        }

    }

    function setExistingRoutes(routes) {

        $scope.selectedStopRoutes = [];

        for (var i = 0; i < routes.length; i++) {
            var routeFound = $filter('filter')($localStorage.allRoutes, { routeShortName: routes[i].routeShortName }, isEqual);
            if (routeFound != null && routeFound.length > 0) {
                routeFound[0].sequence = routes[i].sequence;
                $scope.selectedStopRoutes.push(routeFound[0]);
            }
        }

    }

    $scope.cancel = function (cancel) {
        $state.go('home.man_pis');
    };

    $scope.saveConfig = function (save) {

        if (typeof $scope.caption === 'undefined' || $scope.caption === null || $scope.caption === '') {
            window.alert('Please writedown caption');
            return;
        }

        if (typeof $scope.description === 'undefined' || $scope.description === null || $scope.description === '') {
            window.alert('Please writedown some description');
            return;
        }

        if (typeof $scope.selectedStopRoutes === 'undefined' || $scope.selectedStopRoutes.length == 0) {
            window.alert('Please asign routes to be shown.');
            return;
        }

        if (typeof $scope.pageSize == 'undefined') {
            window.alert('Page size should be between 5 and 25');
            return;
        }

        //$localStorage.selectedRoutes = [];
        var routeArrForServerSave = [];
        for (var i = 0; i < $scope.selectedStopRoutes.length; i++) {
            $scope.selectedStopRoutes[i].sequence = i + 1;
            routeArrForServerSave.push({ "routeId": $scope.selectedStopRoutes[i].routeId, "routeShortName": $scope.selectedStopRoutes[i].routeShortName, "sequence": $scope.selectedStopRoutes[i].sequence });
        }

        var config =
            {
                "selectedStopId": self.selectedStoppage.stopId,
                "selectedRadius": self.selectedRadius.radius,
                "sortByTime": $scope.sortByTime,
                "pageSize": $scope.pageSize,
                "selectedRoutes": routeArrForServerSave
            };

        var payload = null;
        if ($scope.boardNumber === null || typeof ($scope.boardNumber) === 'undefined') {
            //Config generation
            payload = {
                "description": $scope.description,
                "displayCaption": $scope.caption,
                "stopId": self.selectedStoppage.stopId,
                "displayConfig": angular.toJson(config)
            }

        } else {
            //Config modification
            payload = {
                "displayBoardId": $scope.boardNumber,
                "description": $scope.description,
                "displayCaption": $scope.caption,
                "stopId": self.selectedStoppage.stopId,
                "displayConfig": angular.toJson(config)
            }
        }

        //payload = angular.toJson(payload);

        $scope.isSaving = true;

        PISManagementService.updatePISDetails(payload).then(
               function (response) {
                   console.log('response after saving', response);
                   if ($scope.boardNumber == null) {
                       $scope.boardNumber = response.data.displayBoardId;
                       $scope.msg = "Display Board Number : " + $scope.boardNumber;

                   } else {
                       $scope.msg = "Configuration has been updated.";
                   }

                   $scope.isSaving = false;

                   var messageModal = angular.element(document.querySelector('#messageModal'));
                   messageModal.modal('show');

               },
               function (err) {
                   //console.log('get all stops in run failed.');
                   console.log(err);
                   $scope.isSaving = false;
               }
           );

    };

    $scope.msgBoxClose = function () {
        var messageModal = angular.element(document.querySelector('#messageModal'));
        messageModal.modal('hide');

        $timeout(function () { $state.go('home.man_pis'); }, 500);

    }

    $scope.loadRoutes = function () {
        if ($scope.boardNumber == null) {
            $scope.stopRoutes = [];
            $scope.selectedStopRoutes = [];
            // $localStorage.selectedRoutes = [];
            $scope.caption = self.selectedStoppage.stopName;
            loadRoutesByStopId(self.selectedStoppage.stopId);
        }
    };

    function loadRoutesByStopId(stopId) {

        var routeRequest = {
            "passingStopId": stopId
        };
        PISManagementService.getStopRoutes(routeRequest).then(
            function (response) {

                var tempData = $filter('orderBy')(response.data.data, ['routeShortName']);
                if ($scope.selectedStopRoutes != null && $scope.selectedStopRoutes.length > 0) {

                    for (var i = 0; i < tempData.length; i++) {

                        var routeFound = $filter('filter')($scope.selectedStopRoutes, { routeShortName: tempData[i].routeShortName }, isEqual);
                        if (routeFound != null && routeFound.length > 0) {
                            //don't add
                        } else {
                            $scope.stopRoutes.push(tempData[i]);
                        }
                    }

                } else {
                    $scope.stopRoutes = tempData;
                }

                //console.log($scope.stopRoutes);
                $("#stopRoutes").sortable("refresh");
            },
            function (err) {
                console.log(err);
            }
        );

    }



    $scope.sortableOptions = {
        placeholder: "app",
        connectWith: ".apps-container"
    };

    $scope.allDeselected = function () {

        //angular.extend($scope.stopRoutes, $scope.selectedStopRoutes);
        //$scope.selectedStopRoutes = [];
        var array3 = $scope.stopRoutes.concat($scope.selectedStopRoutes).unique();
        $scope.stopRoutes = array3;
        $scope.selectedStopRoutes = [];
    };

    $scope.allSelected = function () {

        var array3 = $scope.selectedStopRoutes.concat($scope.stopRoutes).unique();
        $scope.selectedStopRoutes = array3;
        $scope.stopRoutes = [];
    }

    function isEqual(actual, expected) { return angular.equals(actual, expected) };

    Array.prototype.unique = function () {
        var a = this.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

        return a;
    };


    // Initialize multiple switches
    if (Array.prototype.forEach) {
        var elems = Array.prototype.slice.call(document.querySelectorAll('.switchery'));
        elems.forEach(function (html) {
            var switchery = new Switchery(html, { color: '#4a89dc' });
        });
    }
    else {
        var elems = document.querySelectorAll('.switchery');
        for (var i = 0; i < elems.length; i++) {
            var switchery = new Switchery(elems[i], { color: '#4a89dc' });
        }
    }


    self.onclicksortByTime = function () {

        console.log('onclicksortByTime', $scope.sortByTime);

    }


}

