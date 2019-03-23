/**
 * Created by Ideation on 24-01-2017.
 */
angular.module('controlPanelApp').controller('MonitoringController', MonitoringController);
function MonitoringController($scope, leafletMapEvents, leafletMarkerEvents, MonitoringService, $timeout, $localStorage, $filter, leafletData, leafletBoundsHelpers, MiscServices, $rootScope, Constants, $window) {
    var self = this;

    //Scope variables
    $scope.depots = null;
    // self.selectedAgency = [];
    //$scope.selectedDepot = null;
    // $scope.selectedRoute = null;
    self.selectedStop = null;
    // $scope.selectedRegnNo = null;
    $scope.selectedTab = 'depot_route';
    $scope.isCustomBoundSet = false;
    $scope.showOutOfPath = true;
    $scope.onlyOutOfPath = false;
    $scope.pannedOrZoomed = false;
    $scope.showside = false;
    $scope.menudown = false;
    $scope.refresing = false;

    self.selectedAgencies = [];
    self.selectedDepots = [];
    self.selectedRoutes = [];
    self.selectedVTUs = [];
    $scope.selectedVehicleTypes = [];
    self.selectedRegnNos = [];
    $scope.isClustered = false;
    $scope.isoutOfPath = false;
    self.allStops = []

    var navbarHeight = angular.element(".navbar")[0].offsetHeight;
    $scope.iframeHeight = window.innerHeight - navbarHeight - 30;
    console.log("Height :", $scope.iframeHeight);

    //Scope variables

    $scope.map = {
        defaults: {
            tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            maxZoom: 18,
            minZoom: 14,
            doubleClickZoom: true,
            zoomControlPosition: 'bottomleft',
            zoomControl: true
        },
        markers: {},
        paths: {},
        events: {
            map: {
                enable: ['zoomstart', 'zoomend', 'dragstart', 'dragend', 'click', 'moveend', 'movestart'],
                disable: ['dblclick', 'mousemove'],
                logic: 'emit',
            },
            markers: {
                enable: ['click', 'contextmenu'],
                logic: 'emit',
            }
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz'
                },
            },
            overlays: {
                bus: {
                    name: 'bus layer',
                    type: 'markercluster',
                    visible: true,
                    layerOptions: {
                        attribution: 'Open Street Map',
                        continuousWorld: true
                    }
                }
            }
        }
    };

    $scope.map.center = Constants.DefaultBound;

    $scope.$on('$viewContentLoaded', function (event) {

        var val = {
            message: '',title: '',focus: false,draggable: false,
            lat: $scope.map.center.lat,
            lng: $scope.map.center.lng,
           
            icon: {
                iconUrl: 'images/none.png',
                iconSize: [1, 1]
            }
        };

        $scope.map.markers.selectedStop = val;
        // code that will be executed ... 
        // every time this view is loaded
        $timeout(function () {
            refreshVehicleData();
        }, 1000);

    });

    $scope.$on('leafletDirectiveMap.map.dragend', function (event, args) {
        console.log('within drag end');
        $timeout(function () {
            $scope.newMapCenter = JSON.parse(JSON.stringify($scope.map.center));
            var dist = MiscServices.distanceBwPoints($scope.newMapCenter.lat, $scope.newMapCenter.lng, $scope.oldMapCenter.lat, $scope.oldMapCenter.lng, 'MT');
            console.log(dist);
            if (dist > 500) {
                console.log('forcing vehicle refresh');
                refreshVehicleData();
            }
        }, 500);
        $scope.pannedOrZoomed = true;
    });

    $scope.$on('leafletDirectiveMap.map.zoomstart', function (event, args) {
        console.log('within zoom start');
        $scope.oldMapCenter = JSON.parse(JSON.stringify($scope.map.center));
    });

    $scope.$on('leafletDirectiveMap.map.zoomend', function (event, args) {
        console.log('within zoom end');
        $timeout(function () {
            $scope.newMapCenter = JSON.parse(JSON.stringify($scope.map.center));
            var dist = MiscServices.distanceBwPoints($scope.newMapCenter.lat, $scope.newMapCenter.lng, $scope.oldMapCenter.lat, $scope.oldMapCenter.lng, 'MT');
            console.log(dist);
            if (dist > 500) {
                console.log('forcing vehicle refresh');
                refreshVehicleData();
            }
        }, 500);
        $scope.pannedOrZoomed = true;
    });

    $scope.$on('leafletDirectiveMap.map.dragstart', function (event, args) {
        console.log('within drag start');
        $scope.oldMapCenter = JSON.parse(JSON.stringify($scope.map.center));
    });

    $scope.$on('leafletDirectiveMap.map.click', function (event, args) {
        $scope.map.paths = {};
        $scope.individualPathSet = false;
        $scope.showside = false;
        $scope.menudown = false;
        $scope.selecetdVehicleRegNo = "";
    });

    $scope.$on('leafletDirectiveMarker.map.click', function (event, args) {
        if (args.model.label.options.data.routeCode == null || typeof (args.model.label.options.data.routeCode) == "undefined") {
            return;
        }

        $scope.sidedispData = {
            agencyName: "",
            depotName: "",
            vehicleNo: "",
            crowdStatus: "",
            routeCode: "",
            latitude: "",
            longitude: "",
            source: "",
            destination: "",
            nextStop: "",
            nextStopETA: "",
            percentRouteCovered: "",
            lastStop: ""

        };

        $scope.drawPath({ routeCode: args.model.label.options.data.routeCode });
        $scope.individualPathSet = true;

        $scope.selecetdVehicleRegNo = args.modelName;
        setSideDisplayData(args.model.label.options.data.vehicleNo);
        $scope.showside = true;
    });

    function setSideDisplayData(vehicleRegnNo) {
        var vehicleMarker = $scope.map.markers[vehicleRegnNo];
       
        if (angular.isUndefined(vehicleMarker)) return;

        //var routeObj = $filter('filter')($localStorage.allRoutes, { routeShortName: vehicleMarker.label.options.data.routeCode }, isEqual);
        //let _startStop = '';
        //let _endStop = '';
        //if (angular.isArray(routeObj) && routeObj.length > 0) {
        //    _startStop = routeObj[0].startStop;
        //    _endStop = routeObj[0].endStop;
        //}

       


        $scope.sidedispData = {
            agencyName: vehicleMarker.label.options.data.agencyName,
            depotName: vehicleMarker.label.options.data.depotName,
            vehicleNo: vehicleMarker.label.options.data.vehicleNo,
            crowdStatus: vehicleMarker.label.options.data.crowdStatus,
            routeCode: vehicleMarker.label.options.data.routeCode,
            latitude: vehicleMarker.lat,
            longitude: vehicleMarker.lng,
            source: "",
            destination: "",
            nextStop: angular.isDefined($scope.sidedispData) ? $scope.sidedispData.nextStop : '',
            nextStopETA: angular.isDefined($scope.sidedispData) ? $scope.sidedispData.nextStopETA : '',
            percentRouteCovered: angular.isDefined($scope.sidedispData) ? $scope.sidedispData.percentRouteCovered : '',
            lastStop: angular.isDefined($scope.sidedispData) ? $scope.sidedispData.lastStop : ''

        };

        MonitoringService.getMatchingRoutes(vehicleMarker.label.options.data.routeCode).then(function (response) {
            var matchingRoutesArr = response.data.data;
            var routeObj = $filter('filter')(matchingRoutesArr, { routeShortName: vehicleMarker.label.options.data.routeCode }, isEqual);
            if (angular.isArray(routeObj) && routeObj.length > 0) {
                $scope.sidedispData.source = routeObj[0].startStop;
                $scope.sidedispData.destination = routeObj[0].endStop;
            }

        }, function (err) {
            console.log(err);
        });

        MonitoringService.getVehicleETA({ vehicleNo: vehicleMarker.label.options.data.vehicleNo }).then(
            function (response) {
                if (response.data.data !== undefined) {
                    $scope.sidedispData.percentRouteCovered = response.data.data.percentRouteCovered;
                    for (var i = 0; i < response.data.data.stopTimes.length; i++) {
                        var obj = response.data.data.stopTimes[i];
                        if (obj.stopCrossed === false) {
                            $scope.sidedispData.nextStop = obj.stop.stopName;
                            $scope.sidedispData.nextStopETA = getTimeReadable(obj.timeToReachInSec);

                            if (i != 0) {
                                $scope.sidedispData.lastStop = response.data.data.stopTimes[i - 1].stop.stopName;
                            } else {
                                $scope.sidedispData.lastStop = 'None';
                            }
                            break;
                        }
                    }
                } else {
                    var outOfPathMsg = 'NA';
                    $scope.sidedispData.percentRouteCovered = outOfPathMsg;
                    $scope.sidedispData.nextStop = outOfPathMsg;
                    $scope.sidedispData.nextStopETA = outOfPathMsg;
                    $scope.sidedispData.lastStop = outOfPathMsg;
                }
            },
            function (err) {
                console.log(err);
            }
        );
    }

    function getTimeReadable(timeInSec) {
        var timeStr = '';
        if (timeInSec > 3600)
            timeStr += Math.round(timeInSec / 3600) + 'hr';
        if ((timeInSec % 3600) > 60)
            timeStr += ' ' + Math.round((timeInSec % 3600) / 60) + 'm';
        if (timeInSec < 3600)
            timeStr += ' ' + Math.round(timeInSec % 60) + 's';

        return timeStr.trim();
    }

    $scope.$on('leafletDirectiveMarker.map.contextmenu', function (event, args) {
        console.log('within marker long press');
    });

    //GetAllAgencies();
    GetAllDepots();

    if (threadVar !== null || typeof threadVar !== 'undefined')
        clearInterval(threadVar);

    threadVar = setInterval(refreshVehicleData, 1000 * Constants.VEHICLE_LOC_REFRESH_INTERVAL);

    function refreshVehicleData() {

        var payload = {
            "agencyNames": MiscServices.getSelectedValues(self.selectedAgencies, "agencyName"),
            "depotNames": MiscServices.getSelectedValues(self.selectedDepots, "depotName"),
            "routeCodes": MiscServices.getSelectedValues(self.selectedRoutes, "routeShortName"),
            "vehicleNos": MiscServices.getSelectedValues(self.selectedRegnNos, "vehicleRegNo"), //getSelectedRegnNos(),
            "dataSources": MiscServices.getSelectedValues(self.selectedVTUs, "dataSource"),
            "pointNW": {
                "latitude": $scope.map.bounds.northEast.lat,
                "longitude": $scope.map.bounds.southWest.lng
            },
            "pointSE": {
                "latitude": $scope.map.bounds.southWest.lat,
                "longitude": $scope.map.bounds.northEast.lng
            },
            "vehicleTypes": ["BUS", "TRAM", "PUJO", "FIFA"]
        };
        console.log('payload');
        console.log(payload);
        MonitoringService.getVehicleStatusByFilter(payload).then(
            function (response) {
                console.log(response.data.data);
                if ($scope.onlyOutOfPath === true) {
                    $scope.vehicles = $scope.removeInPathVehicles(response.data.data);
                } else {
                    $scope.vehicles = response.data.data;
                }
                drawVehiclesWithinBoundary($scope.vehicles, !$scope.isCustomBoundSet);
            },
            function (err) {

            }
        );



    }

    $scope.removeInPathVehicles = function (vehicleList) {
        console.log('total vehicleList', vehicleList.length);
        var returnList = [];
        for (var i = 0; i < vehicleList.length; i++) {
            if (vehicleList[i].outOfPath === true) {
                returnList.push(vehicleList[i]);
            }

        }

        console.log('out of path vehicleList', returnList.length);
        return returnList;
    }


    function drawVehiclesWithinBoundary(obj, isCustomBound) {
        //console.log("ARNAB",$scope.showOutOfPath);
        var mapMarkers = {};
        if (obj != null && obj.length > 0) {
            var crowdStatus = "NA";
            var vehicleType = "BUS";
            var className = "bus_n";
            angular.forEach(obj, function (item, index) {
                vehicleType = item.vehicleType.toUpperCase();
                if (item.lastLocation.latitude !== null && item.lastLocation.longitude !== null && vehicleType !== "AMBULANCE" && vehicleType !== "POLICECAR") {
                    if (item.crowd != null) {
                        switch (item.crowd.toUpperCase()) {
                            case "H":
                                crowdStatus = 'High';
                                break;
                            case "M":
                                crowdStatus = 'Medium';
                                break;
                            case "L":
                                crowdStatus = 'Low';
                                break;
                            default:
                                item.crowd = 'N';
                                crowdStatus = 'NA';
                                break;
                        }
                    } else {
                        item.crowd = 'N';
                    }
                    className = (vehicleType + '_' + item.crowd).toLowerCase();

                    if (($scope.isoutOfPath) && item.outOfPath === true)
                        className = className + " pulse1";

                    console.log('className', className);

                    var key = item.vehicle.vehicleRegNo;
                    var val = {
                        title: '',
                        lat: item.lastLocation.latitude,
                        lng: item.lastLocation.longitude,
                        focus: false,
                        draggable: false,
                        //group:  ($scope.isClustered ? '1' : undefined),
                        icon: {
                            type: 'div',
                            className: className,
                            iconSize: [busIconSize, busIconSize],
                            popupAnchor: [0, -10],
                            iconAngle: 120,
                            html: "<div>" + (item.routeCode == null ? "UNK" : (item.routeCode.indexOf(':') > 0 ? item.routeCode.split(':')[0] : item.routeCode)) + "</div>"
                            //html: "<div>" + " " + "</div>" //msrtc
                        },
                        message: "<div><div>" + item.vehicleNo + "</div></div>",
                        label: {
                            options: {
                                data: {
                                    "type": "vehicle",
                                    "agencyName": item.vehicle.agencyName,
                                    "depotName": item.vehicle.depotName,
                                    "vehicleType": vehicleType,
                                    "routeCode": item.routeCode,
                                    "vehicleNo": item.vehicle.vehicleRegNo,
                                    "crowdStatus": crowdStatus,
                                    "lastTime": item.lastTime
                                }
                            }
                        },
                    };

                    if ($scope.isClustered) {
                        $timeout(function () {
                            val.layer = 'bus'; //for clustering
                        }, 0)
                    }

                    mapMarkers[key] = val;
                }

            });

        }

        $timeout(function () {
            $scope.map.markers = mapMarkers;
        }, 0);

        $timeout(function () {
            if (self.selectedStop != null) {
                showSletectedStop(false);
            }
        }, 100);
        

        if (isCustomBound) {
            var locations = [];
            if (obj.length > 0) {
                angular.forEach(obj, function (item, index) {
                    if (item.lastLocation.latitude != null && item.lastLocation.longitude != null)
                        this.push({ "pointLat": item.lastLocation.latitude, "pointLng": item.lastLocation.longitude });
                }, locations);

                var size = { x: 0, y: 0 };
                leafletData.getMap().then(function (map) {
                    size = map.getSize();
                    var customBound = getCustomBound(locations, size.x, size.y);
                    console.log('customBound using vehicle data');
                    console.log(customBound);
                    $scope.map.center = customBound;
                    map.invalidateSize();
                    console.log('map bound set by buses');
                    $scope.isCustomBoundSet = true;
                });

            }
        }

        if ($scope.selecetdVehicleRegNo != null && $scope.selecetdVehicleRegNo != "") {
            setSideDisplayData($scope.selecetdVehicleRegNo);
        }

    };

    function GetAllDepots() {
        MonitoringService.getDepots().then(function (response) {
            console.log(response.data.data);
            $localStorage.depots = response.data.data;
            self.allDepots = $localStorage.depots;
        }, function (err) {
            console.log(err);
        });
    }


    function GetRoutesByDepot(depot) {
        MonitoringService.getRoutes(depot)
            .then(function (response) {
                console.log('within getroutes');
                console.log(response.data.data);
                $localStorage.depotwiseRoutes = response.data.data;
            }, function (err) {
                console.log(err);
            });
    }


    $scope.getMatchesDepots = function (depotSearchText) {
        //var search = searchText.toUpperCase();
        var arr1 = $filter('filter')($localStorage.depots, { depotName: depotSearchText });
        return arr1;
    }

    $scope.onDepotSelected = function (item) {
        //var search = searchText.toUpperCase();
        console.log('within onDepotSelected');
        if (typeof item !== 'undefined') {
            $scope.selectedDepot = item;
            GetRoutesByDepot($scope.selectedDepot.depotName);
            $scope.isCustomBoundSet = false;
            if (threadVar !== null || typeof threadVar !== 'undefined')
                clearInterval(threadVar);

            refreshVehicleData();
            threadVar = setInterval(refreshVehicleData, 1000 * Constants.VEHICLE_LOC_REFRESH_INTERVAL);
        }
    }

    $scope.getMatchesRoutes = function (routeSearchText) {
        //var search = searchText.toUpperCase();
        var arr1 = $filter('filter')($localStorage.allRoutes, { routeShortName: routeSearchText });
        var arr2 = $filter('filter')($localStorage.allRoutes, { routeLongName: routeSearchText });
        return arrayUnion(arr1, arr2, areRouteEqual);
    }

    // $scope.getMatchesVehicleNos = function (RegnSearchText) {
    //     //var search = searchText.toUpperCase();
    //     var arr1 = $filter('filter')($localStorage.vehicleNos, {vehicleRegNo: RegnSearchText});
    //     return arr1;
    // }

    $scope.onRouteSelected = function (item) {
        //var search = searchText.toUpperCase();
        console.log(item);
        if (typeof item !== 'undefined') {
            $scope.selectedRoute = item;
            $scope.isCustomBoundSet = false;
            if (threadVar !== null || typeof threadVar !== 'undefined')
                clearInterval(threadVar);

            refreshVehicleData();
            threadVar = setInterval(refreshVehicleData, 1000 * Constants.VEHICLE_LOC_REFRESH_INTERVAL);
        }
        $scope.pannedOrZoomed = false;
        $scope.drawPath({ routeCode: item.routeShortName });
    }

    $scope.drawPath = function (routeCode) {
        MonitoringService.getPathByRoute(routeCode).then(
            function (response) {
                var path = $scope.cleanPath(response.data.data);
                $scope.map.paths = { p1: { color: '#008000', weight: 5, latlngs: path } };
                //setting map bounds now if user has not panned or zoomed
                if (!$scope.pannedOrZoomed) {
                    var p1 = path[0];
                    var p2 = path[Math.ceil(path.length - 1)];
                    var p3 = path[Math.ceil(path.length * 0.25)];
                    var p4 = path[Math.ceil(path.length * 0.75)];
                    var p5 = path[Math.ceil(path.length * 0.50)];

                    var tempbounds = [[p1.lat, p1.lng], [p2.lat, p2.lng]];
                    var bounds = leafletBoundsHelpers.createBoundsFromArray(tempbounds);
                    $scope.map.bounds = bounds;
                }
            },
            function (error) {
                console.log(error);
            }
        );
    }

    $scope.cleanPath = function (dirtyPathArray) {
        var returnArray = [];
        for (var i = 0; i < dirtyPathArray.length; i++) {
            var tempObj = { lat: dirtyPathArray[i].pointLat, lng: dirtyPathArray[i].pointLng }
            returnArray.push(tempObj);
        }
        return returnArray;
    }

    $scope.onRegnNoSelected = function (item) {
        //var search = searchText.toUpperCase();
        console.log('within onRegnNoSelected');
        if (typeof item !== 'undefined') {
            $scope.selectedRegnNo = item;
            $scope.isCustomBoundSet = false;
            if (threadVar !== null || typeof threadVar !== 'undefined')
                clearInterval(threadVar);

            refreshVehicleData();
            threadVar = setInterval(refreshVehicleData, 1000 * Constants.VEHICLE_LOC_REFRESH_INTERVAL);

        }
        $scope.pannedOrZoomed = false;
    }

    $scope.OnTabSelected = function (val) {

        if (val === 'depot_route') {
            $scope.selectedTab = 'depot_route';
            $scope.selectedRegnNo = null;
            var regnNoInputText = angular.element(document.querySelector('#acRegnNo'));
            regnNoInputText.val('');

        } else if ('vehicle_regn') {
            $scope.selectedTab = 'vehicle_regn';
            $scope.selectedDepot = null;
            $scope.selectedRoute = null;
            //GetAllRegnNos("bus");
            var depotInputText = angular.element(document.querySelector('#acDepot'));
            depotInputText.val('');
            var routeInputText = angular.element(document.querySelector('#acRoute'));
            routeInputText.val('');
        }
    }


    $scope.$on('$destroy', function () {
        // clean up stuff
        if (threadVar !== null || typeof threadVar !== 'undefined')
            clearInterval(threadVar);
    });

    self.outOfPathChecked = function () {

        //$scope.isoutOfPath = !$scope.isoutOfPath;

        console.log('outOfPathChecked', $scope.isoutOfPath);
        $timeout(function () {
            refreshVehicleData();
        }, 500);
        console.log('checked');
    }

    self.onlyoutOfPathChecked = function () {

        console.log('onlyOutOfPath', $scope.onlyOutOfPath);
        $timeout(function () {
            refreshVehicleData();
        }, 500);
        console.log('checked');
    }

    self.enableClusterChecked = function () {

        //$scope.isClustered = !$scope.isClustered;

        console.log('enableClusterChecked', $scope.isClustered);


        $timeout(function () {
            $scope.map.markers = {};
        }, 0);

        $timeout(function () {
            refreshVehicleData();
        }, 100);
        console.log('checked');
    }

    $scope.slideMenu = function () {
        $scope.showside = false;
        $scope.menudown = true;
    }

    $scope.jumpToStop = function (selectedItem, model) {
        if (self.selectedStop == null || angular.isUndefined(self.selectedStop)) return;
        $scope.map.center = { lat: self.selectedStop.stopLat, lng: self.selectedStop.stopLon, zoom: 16 };
        showSletectedStop(true);
    }

    function showSletectedStop(focus) {
        var val = {
            message: self.selectedStop.stopName,
            title: 'title',
            lat: $scope.map.center.lat,
            lng: $scope.map.center.lng,
            focus: focus,
            draggable: false,
            icon: {
                iconUrl: 'images/stoppage-marker.png',
                iconSize: [25, 35],
                iconAnchor: [Math.round(25 / 2), 35],
                popupAnchor: [-2, -26]
            }
        };

        $scope.map.markers.selectedStop = val;

        /*
		var  circle = {
			type: "circle",
			radius: 2000,
			latlngs: [$scope.map.center.lat, $scope.map.center.lng]
		};
		$scope.map.paths["circle"] = circle;
        */
    }

    $scope.allVehicleTypes = [{ "vehicleType": "bus", "ticked": false }, { "vehicleType": "tram", "ticked": false }, { "vehicleType": "ambulance", "ticked": false }];


    
    function isEqual(actual, expected) {
        return angular.equals(actual, expected)
    };
    

    $scope.loadVehiclesAsync = function (search) {
        $scope.refresingVehicle = true;
        console.log('search', search);
        MonitoringService.getMatchingVehicleNos('*', search).then(function (response) {
            self.allRegnNos = response.data.data;
            $scope.refresingVehicle = false;

        }, function (err) {
            console.log(err);
        });


    }

    $scope.loadStopsAsync = function (search) {
        $scope.refresingStop = true;
        console.log('search', search);
        //var filteredList = $filter('filter')($localStorage.vehicleNos, { vehicleRegNo: search });
        MonitoringService.getMatchingStops(search).then(function (response) {
            self.allStops = response.data.data;
            $scope.refresingStop = false;
            console.log("AllStops", response.data.data);
        }, function (err) {
            console.log(err);
        });

    }

    $scope.loadRoutesAsync = function (search) {
        $scope.refresingRoute = true;
        console.log('search', search);
        MonitoringService.getMatchingRoutes(search).then(function (response) {
            self.allRoutes = response.data.data;
            $scope.refresingRoute = false;

        }, function (err) {
            console.log(err);
        });


    }


    // Initialize multiple switches
    if (Array.prototype.forEach) {
        var elems = Array.prototype.slice.call(document.querySelectorAll('.switchery'));
        elems.forEach(function (html) {
            var switchery = new Switchery(html, { color: '#4a89dc' });
            console.log("switchery", switchery);
        });
    }
    else {
        var elems = document.querySelectorAll('.switchery');
        for (var i = 0; i < elems.length; i++) {
            var switchery = new Switchery(elems[i], { color: '#4a89dc' });
        }
    }

    var w = angular.element($window);

    w.bind('resize', function () {
        $scope.iframeHeight = window.innerHeight - navbarHeight - 35;
        if (window.innerWidth <= 412) {
            $scope.iframeHeight = window.innerHeight - navbarHeight;
        }

        console.log('calculated height', $scope.iframeHeight);

        $timeout(function () {
            leafletData.getMap().then(function (map) {
                map.invalidateSize();
            });
        }, 100);
    });


}

