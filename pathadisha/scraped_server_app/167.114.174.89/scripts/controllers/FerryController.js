/**
 * Created by Arnab Ganguly on 04-01-2019s.
 */
angular.module('controlPanelApp').controller('FerryController', FerryController);
function FerryController(MonitoringService, leafletMapEvents, leafletMarkerEvents, $interval, $rootScope, $sessionStorage, leafletData, leafletBoundsHelpers, $state, $timeout, $scope, $localStorage, Constants) {
    //var self = this;
    //$scope.showside = false;
    //$scope.menudown = false;
   
    var navbarHeight = angular.element(".navbar")[0].offsetHeight;
    $scope.iframeHeight = window.innerHeight - navbarHeight - 35;
    console.log("Height :", $scope.iframeHeight);

  
    $scope.map = {
        defaults: {
            tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            maxZoom: 18,
            minZoom: 12,
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


    if ($localStorage.ferryMapCenter !== null && typeof ($localStorage.ferryMapCenter) !== 'undefined') {
        $scope.map.center = $localStorage.ferryMapCenter;
        console.log('ARNAB11111');
    } else {
        //$scope.map.center = { lat: 21.760995, lng: 88.236669, zoom: 12 }; //Namkhana Ferry Ghat
        $scope.map.center = { lat: 22.658068, lng: 88.379395, zoom: 12 };
        console.log('ARNAB2222');
    }

    $scope.$on('$viewContentLoaded', function (event) {
        // code that will be executed ... 
        // every time this view is loaded
        console.log('Ferry-viewContentLoaded', true);

        if (threadVar !== null || typeof threadVar !== 'undefined')
            clearInterval(threadVar);

        threadVar = setInterval(refreshData, 1000 * Constants.VEHICLE_LOC_REFRESH_INTERVAL);

        $timeout(function () {
            refreshData();
        }, 1000);

    });

 
    $rootScope.$on('leafletDirectiveMap.map.dragend', function (event, args) {
        //console.log('within drag end');
        //console.log(self.map.center);
        $localStorage.ferryMapCenter = $scope.map.center;
        refreshData();
    });

    $rootScope.$on('leafletDirectiveMap.map.zoomstart', function (event, args) {
        // console.log('within zoom start');
    });

    $rootScope.$on('leafletDirectiveMap.map.zoomend', function (event, args) {
        // console.log('within zoom end');
        $localStorage.ferryMapCenter = $scope.map.center;
        refreshData();
    });

    $rootScope.$on('leafletDirectiveMap.map.dragstart', function (event, args) {
        //console.log('within drag start');
    });

    $rootScope.$on('leafletDirectiveMarker.map.click', function (event, args) {
        console.log('within directive marker map click');

    });

    $rootScope.$on('leafletDirectiveMarker.map.contextmenu', function (event, args) {
        //  console.log('within directive marker map context menu');
    });

    function refreshData() {
        leafletData.getMap().then(function (map) {
            var bnds = map.getBounds();
            console.log('bnds', bnds);
            var payload = {
                "agencyNames": [],
                "depotNames": [],
                "routeCodes": [],
                "vehicleNos": [],
                "dataSources": [],
                "pointNW": {
                    "latitude": bnds._northEast.lat,
                    "longitude": bnds._southWest.lng
                },
                "pointSE": {
                    "latitude": bnds._southWest.lat,
                    "longitude": bnds._northEast.lng
                },
                "vehicleTypes": ["FERRY"]
            };
             console.log('payload-Ferry: refreshData',payload);
            MonitoringService.getVehicleStatusByFilter(payload).then(
                function (response) {
                    console.log(response.data.data);
                    $scope.FerryList = response.data.data;
                    drawMarkerOnMap($scope.FerryList);
                },
                function (err) {

                }
            );


        });

    }

    function drawMarkerOnMap(list) {
        var mapMarkers = {};

        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            console.log('ARNAB333333', item);
            var key = item.vehicle.vehicleRegNo;
            mapMarkers[key] = createMarker(item, false);         
        }

        console.log('ARNAB4444', mapMarkers);
        $scope.map.markers = mapMarkers;
    }

    function createMarker(item, isSelected) {

        var className = 'ferry_marker_icon';
        var imgAngle = 0;

        //imgAngle = item.angle - 90; //image default direction is 90 degree towars east
        //if (isSelected) {
        //    className = 'ferry_marker_icon';
        //    //if (item.crowd.toUpperCase() === "O") {
        //    //    crowdStatus = 'Occupied';
        //    //}
        //    //else {
        //    //    crowdStatus = 'Empty';
        //    //}

        //} else {
        //    if (item.crowd != null) {
        //        if (item.crowd.toUpperCase() === "O") {
        //            if (item.vehicle.vehicleAdditionalInfo != null) {

        //                if (item.vehicle.vehicleAdditionalInfo.tripCategory === "A") {
        //                    //category - critical
        //                    className = 'ambulance_marker_icon_occupied_A';
        //                } else if (item.vehicle.vehicleAdditionalInfo.tripCategory === "B") {
        //                    //category - less critical
        //                    className = 'ambulance_marker_icon_occupied_B';
        //                } else if (item.vehicle.vehicleAdditionalInfo.tripCategory === "C") {
        //                    //category - not critical
        //                    className = 'ambulance_marker_icon_occupied_C';
        //                } else {
        //                    className = 'ambulance_marker_icon_occupied';
        //                }

        //            } else {
        //                className = 'ambulance_marker_icon_occupied';
        //            }


        //            //crowdStatus = 'Occupied';
        //        }
        //        else if (item.crowd.toUpperCase() === "B") {
        //            className = 'ambulance_marker_icon_blue';
        //            //crowdStatus = 'Occupied';
        //        }
        //        else {
        //            className = 'ambulance_marker_icon';
        //            //crowdStatus = 'Empty';
        //        }

        //    }
        //}


        //var htmlMarker = "<div class='" + className + "' style='height:18px; width:35px; padding:0px; padding-right:1px; text-align: right;" + " transform: rotate(" + imgAngle + "deg) !important; transition: all 2s ease;" + "'></div>";
       // console.log(htmlMarker);
        var val = {
            title: '',
            lat: item.lastLocation.latitude,
            lng: item.lastLocation.longitude,
            focus: false,
            draggable: false,
            icon: {
                type: 'div',
                className: className,
                iconSize: [24, 28],
                iconAnchor: [Math.round(24 / 2), 28],
                popupAnchor: [0, -10],
                html: ''
            },
            label: {
                options: {
                    //data: {
                    //    "type": "ambulance",
                    //    "contact": item.contactNo,
                    //    "vehicleNo": item.vehicleNo,
                    //    "crowdStatus": item.crowd,
                    //    "lastTime": item.lastTime,
                    //    "lastLocation": item.lastLocation,
                    //    "speed": item.speed,
                    //    "angle": item.angle,
                    //    "vehicle": item.vehicle

                    //}
                }
            },

        };

        console.log('createMarker', val);
        return val;
    }


}