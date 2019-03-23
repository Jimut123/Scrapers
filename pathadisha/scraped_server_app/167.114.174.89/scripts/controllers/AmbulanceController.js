/**
 * Created by Aditya on 22-05-2017.
 */
angular.module('controlPanelApp').controller('AmbulanceController', AmbulanceController);
function AmbulanceController(MonitoringService, leafletMapEvents, leafletMarkerEvents, $interval, $rootScope, $sessionStorage, leafletData, leafletBoundsHelpers, $state, AmbulanceService, $timeout, $scope, $localStorage) {
    var self = this;
    self.showside = false;
    self.menudown = false;
    self.selectedRegnNos = [];
    self.selectedNodalAgencies = [];
    self.selectedAmbulanceTypes = [];

    var navbarHeight = angular.element(".navbar")[0].offsetHeight;
    $scope.iframeHeight = window.innerHeight - navbarHeight - 35;
    console.log("Height :", $scope.iframeHeight);

    self.map = {
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
        }
    };

    if ($localStorage.ambMapCenter !== null && typeof ($localStorage.ambMapCenter) !== 'undefined') {
        self.map.center = $localStorage.ambMapCenter;
    } else {
        self.map.center = { lat: 22.585167, lng: 88.380374, zoom: 12 };
    }

    $scope.$on('$viewContentLoaded', function (event) {
        // code that will be executed ... 
        // every time this view is loaded
        console.log('viewContentLoaded', true);
        $timeout(function () {
            refreshAmbulanceData();
        }, 1000);

    });

    GetAllNodalAgencies("");
    GetAllAmbulanceTypes();

    $rootScope.$on('leafletDirectiveMap.map.dragend', function (event, args) {
        //console.log('within drag end');
        //console.log(self.map.center);
        $localStorage.ambMapCenter = self.map.center;

    });

    $rootScope.$on('leafletDirectiveMap.map.zoomstart', function (event, args) {
        // console.log('within zoom start');
    });

    $rootScope.$on('leafletDirectiveMap.map.zoomend', function (event, args) {
        // console.log('within zoom end');
        $localStorage.ambMapCenter = self.map.center;
    });

    $rootScope.$on('leafletDirectiveMap.map.dragstart', function (event, args) {
        //console.log('within drag start');
    });

    $rootScope.$on('leafletDirectiveMap.map.click', function (event, args) {
        console.log('within directive map click');
        self.showside = false;
        if (self.selectedVehicle != null) {
            var existingMarker = self.map.markers[self.selectedVehicle.label.options.data.vehicleNo];
            setDeSelectedVehicle(existingMarker);
            self.selectedVehicle = null;
        }

    });

    $rootScope.$on('leafletDirectiveMarker.map.click', function (event, args) {
        console.log('within directive marker map click');

        if (self.selectedVehicle != null) {
            var existingMarker = self.map.markers[self.selectedVehicle.label.options.data.vehicleNo];
            setDeSelectedVehicle(existingMarker);
            self.selectedVehicle = null;
        }

        var markerAmbulance = self.map.markers[args.modelName];
        setSideDisplayData(markerAmbulance);

        if (!self.showside)
            self.showside = true;

        self.selectedVehicle = markerAmbulance;
        var existingMarker = self.map.markers[self.selectedVehicle.label.options.data.vehicleNo];
        setSelectedVehicle(existingMarker);

        //ambulance requisition
        $sessionStorage.selectedAmbulanceAgency = existingMarker.label.options.data.vehicle.nodalAgency.nodalAgencyName;
        $sessionStorage.selectedAmbulancePhone = existingMarker.label.options.data.vehicle.nodalAgency.nodalAgencyPhone;
        $sessionStorage.selectedAmbulanceNo = existingMarker.label.options.data.vehicleNo;
        $sessionStorage.ambulanceStatus = markerAmbulance.label.options.data.crowdStatus;

    });

    function setSideDisplayData(markerAmbulance) {
        self.sidedispData = {
            vehicleNo: markerAmbulance.label.options.data.vehicleNo,
            crowdStatus: markerAmbulance.label.options.data.crowdStatus,
            contact: markerAmbulance.label.options.data.contact,
            speed: markerAmbulance.label.options.data.speed,
            latitude: markerAmbulance.lat,
            longitude: markerAmbulance.lng,
            nodalAgencyName: markerAmbulance.label.options.data.vehicle.nodalAgency.nodalAgencyName,
            nodalAgencyPhone: markerAmbulance.label.options.data.vehicle.nodalAgency.nodalAgencyPhone,
            publiclyVisible: (markerAmbulance.label.options.data.vehicle.publiclyVisible === "Y" ? "Yes" : "No"),
            facilityType: markerAmbulance.label.options.data.vehicle.vehicleDetail.facilityType,

            isOccupiedOrBooked: (markerAmbulance.label.options.data.crowdStatus === "O" || markerAmbulance.label.options.data.crowdStatus === "B"),

            source: ((angular.isDefined(markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo) && markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo !== null) ? markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo.source : ''),
            destination: ((angular.isDefined(markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo) && markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo !== null) ? markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo.destination : ''),

            tripCategory: ((angular.isDefined(markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo) && markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo !== null) ? markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo.tripCategory : ''),
            greenCorridor: ((angular.isDefined(markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo) && markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo !== null) ? markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo.greenCorridor : ''),
            goldenTime: ((angular.isDefined(markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo) && markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo !== null) ? markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo.goldenTime : ''),
            patientContactNo: ((angular.isDefined(markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo) && markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo !== null) ? markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo.patientContactNo : ''),
            driverName: ((angular.isDefined(markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo) && markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo !== null) ? markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo.driverName : ''),
            driverPhoneNo: ((angular.isDefined(markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo) && markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo !== null) ? markerAmbulance.label.options.data.vehicle.vehicleAdditionalInfo.driverPhoneNo : ''),

        };

        self.showside = true;
    }

    function setSelectedVehicle(marker) {

        var item = { lastLocation: { latitude: 0, longitude: 0 } };
        item.lastLocation.latitude = marker.lat;
        item.lastLocation.longitude = marker.lng;
        //item.routeCode = data.routeCode;
        item.vehicleNo = marker.label.options.data.vehicleNo;
        item.crowd = marker.label.options.data.crowdStatus;
        item.lastTime = marker.label.options.data.lastTime;
        item.angle = marker.label.options.data.angle;
        item.vehicle = marker.label.options.data.vehicle;
        self.map.markers[marker.label.options.data.vehicleNo] = createAmbulanceMarker(item, true);

    }

    function setDeSelectedVehicle(marker) {

        var item = { "lastLocation": { latitude: 0, longitude: 0 } };
        item.lastLocation.latitude = marker.lat;
        item.lastLocation.longitude = marker.lng;
        //item.routeCode = data.routeCode;
        item.vehicleNo = marker.label.options.data.vehicleNo;
        item.crowd = marker.label.options.data.crowdStatus;
        item.lastTime = marker.label.options.data.lastTime;
        item.angle = marker.label.options.data.angle;
        item.vehicle = marker.label.options.data.vehicle;
        self.map.markers[marker.label.options.data.vehicleNo] = createAmbulanceMarker(item, false);

    }

    $rootScope.$on('leafletDirectiveMarker.map.contextmenu', function (event, args) {
        //  console.log('within directive marker map context menu');
    });

    function refreshAmbulanceData() {
        leafletData.getMap().then(function (map) {
            var bnds = map.getBounds();
            var payload = {
                "vehicleType": "ambulance",
                "pointNW": {
                    "latitude": bnds._northEast.lat,
                    "longitude": bnds._southWest.lng
                },
                "pointSE": {
                    "latitude": bnds._southWest.lat,
                    "longitude": bnds._northEast.lng
                },
                "vehicleNos": getSelectedRegnNos()
            };

            MonitoringService.getAmbulancePosition(payload).then(
                function (response) {
                    self.ambulanceList = getFlteredAmbulances(response.data.data);
                    drawAmbulanceOnMap(self.ambulanceList);
                },
                function (err) {
                    console.log(err);
                }
            );

        });

    }

    //function isEqual(actual, expected) { return angular.equals(actual, expected) };
    //var arr = $filter('filter')(ambList, { vehicleRegNo: "value" }, isEqual);

    function getFlteredAmbulances(ambList) {
        var filteredList1 = [];
        var filteredList2 = [];
        var filteredList3 = [];

        if (self.selectedNodalAgencies != null && self.selectedNodalAgencies.length > 0) {
            for (var i = 0; i < ambList.length; i++) {
                var keepGoing = true;
                angular.forEach(self.selectedNodalAgencies, function (eachItem, key) {
                    if (eachItem.nodalAgencyName === ambList[i].vehicle.nodalAgency.nodalAgencyName) {
                        if (keepGoing) {
                            filteredList1.push(ambList[i]);
                            keepGoing = false;
                        }
                    }
                });
            }

        } else {
            filteredList1 = ambList;
        }

        if (self.selectedAmbulanceTypes != null && self.selectedAmbulanceTypes.length > 0) {

            for (var i = 0; i < filteredList1.length; i++) {
                var keepGoing = true;
                angular.forEach(self.selectedAmbulanceTypes, function (eachItem, key) {
                    if (eachItem.ambulanceType === filteredList1[i].vehicle.vehicleDetail.facilityType) {
                        if (keepGoing) {
                            filteredList2.push(filteredList1[i]);
                            keepGoing = false;
                        }
                    }
                });
            }

        } else {
            filteredList2 = filteredList1;
        }

        if (self.selectedRegnNos != null && self.selectedRegnNos.length > 0) {

            for (var i = 0; i < filteredList2.length; i++) {
                var keepGoing = true;
                angular.forEach(self.selectedAmbulanceTypes, function (eachItem, key) {
                    if (eachItem.vehicleRegNo === filteredList2[i].vehicle.vehicleRegNo) {
                        if (keepGoing) {
                            filteredList3.push(filteredList2[i]);
                            keepGoing = false;
                        }
                    }
                });
            }

        } else {
            filteredList3 = filteredList2;
        }

        return filteredList3;
    }

    function drawAmbulanceOnMapOld(ambList) {
        console.log(ambList);
        var mapMarkers = {};

        for (var i = 0; i < ambList.length; i++) {
            var item = ambList[i];
            console.log(item);
            if (item.crowd === 'E') {
                var iconType = 'ambulance_red';
            } else {
                var iconType = 'ambulance_purple';
            }
            var key = item.vehicleNo;
            var val = {
                title: '',
                lat: item.lastLocation.latitude,
                lng: item.lastLocation.longitude,
                focus: false,
                draggable: false,
                icon: {
                    iconUrl: '../../images/' + iconType + '.png',
                    iconSize: [busIconSize, busIconSize],
                },
                label: {
                    options: {
                        data: {
                            "type": "vehicle",
                            "contact": item.contactNo,
                            "vehicleNo": item.vehicleNo,
                            "crowdStatus": item.crowd,
                            "lastTime": item.lastTime,
                            "lastLocation": item.lastLocation,
                            "speed": item.speed,
                            "vehicle": item.vehicle
                        }
                    }
                },
            };
            mapMarkers[key] = val;
        }

        self.map.markers = mapMarkers;
    }

    function drawAmbulanceOnMap(ambList) {
        var mapMarkers = {};

        for (var i = 0; i < ambList.length; i++) {
            var item = ambList[i];
            var key = item.vehicleNo;
            if (item.vehicleType.toUpperCase() === "AMBULANCE") {
                mapMarkers[key] = createAmbulanceMarker(item, false);
            }

        }

        self.map.markers = mapMarkers;

        if (typeof ($sessionStorage.ambReqiNo) !== 'undefined' && $sessionStorage.ambReqiNo !== null) {

            var markerAmbulance = self.map.markers[$sessionStorage.ambReqiNo];
            self.selectedVehicle = markerAmbulance;
            //self.map.center = { lat: markerAmbulance.lat, lng: markerAmbulance.lng, zoom: 16 };
            $sessionStorage.ambReqiNo = null;

        }

        if (self.selectedVehicle != null) {
            var existingMarker = self.map.markers[self.selectedVehicle.label.options.data.vehicleNo];
            setSelectedVehicle(existingMarker);
            self.map.center = { lat: existingMarker.lat, lng: existingMarker.lng, zoom: self.map.center.zoom };

            setSideDisplayData(existingMarker);

        }

    }

    function createAmbulanceMarker(item, isSelected) {

        var className = 'ambulance_marker_icon';
        var imgAngle = 0;

        imgAngle = item.angle - 90; //image default direction is 90 degree towars east
        if (isSelected) {
            className = 'ambulance_marker_icon_selected';
            //if (item.crowd.toUpperCase() === "O") {
            //    crowdStatus = 'Occupied';
            //}
            //else {
            //    crowdStatus = 'Empty';
            //}

        } else {
            if (item.crowd != null) {
                if (item.crowd.toUpperCase() === "O") {
                    if (item.vehicle.vehicleAdditionalInfo != null) {

                        if (item.vehicle.vehicleAdditionalInfo.tripCategory === "A") {
                            //category - critical
                            className = 'ambulance_marker_icon_occupied_A';
                        } else if (item.vehicle.vehicleAdditionalInfo.tripCategory === "B") {
                            //category - less critical
                            className = 'ambulance_marker_icon_occupied_B';
                        } else if (item.vehicle.vehicleAdditionalInfo.tripCategory === "C") {
                            //category - not critical
                            className = 'ambulance_marker_icon_occupied_C';
                        } else {
                            className = 'ambulance_marker_icon_occupied';
                        }

                    } else {
                        className = 'ambulance_marker_icon_occupied';
                    }


                    //crowdStatus = 'Occupied';
                }
                else if (item.crowd.toUpperCase() === "B") {
                    className = 'ambulance_marker_icon_blue';
                    //crowdStatus = 'Occupied';
                }
                else {
                    className = 'ambulance_marker_icon';
                    //crowdStatus = 'Empty';
                }

            }
        }


        var htmlMarker = "<div class='" + className + "' style='height:18px; width:35px; padding:0px; padding-right:1px; text-align: right;" + " transform: rotate(" + imgAngle + "deg) !important; transition: all 2s ease;" + "'></div>";
        //console.log(htmlMarker);
        var val = {
            title: '',
            lat: item.lastLocation.latitude,
            lng: item.lastLocation.longitude,
            focus: false,
            draggable: false,
            icon: {
                type: 'div',
                className: 'ambulance_marker_div',
                iconSize: [35, 18],
                iconAnchor: [Math.round(35 / 2), 18],
                popupAnchor: [0, -10],
                html: htmlMarker
            },
            label: {
                options: {
                    data: {
                        "type": "ambulance",
                        "contact": item.contactNo,
                        "vehicleNo": item.vehicleNo,
                        "crowdStatus": item.crowd,
                        "lastTime": item.lastTime,
                        "lastLocation": item.lastLocation,
                        "speed": item.speed,
                        "angle": item.angle,
                        "vehicle": item.vehicle

                    }
                }
            },

        };

        return val;
    }

    refreshAmbulanceData();

    if (threadVar !== null || typeof threadVar !== 'undefined')
        clearInterval(threadVar);

    threadVar = setInterval(refreshAmbulanceData, 1000 * 10);

    //utility functions
    self.getDispOccupancy = function (code) {
        switch (code) {
            case 'E':
                return 'Unoccupied';
                break;
            case 'O':
                return 'Occupied';
                break;
            case 'B':
                return 'Booked';
                break;
            default:
                return 'NA';
                break;
        }
    }
    //utility functions
    self.getDispCategory = function (code) {
        switch (code) {
            case 'A':
                return 'A - Critical';
                break;
            case 'B':
                return 'B - Less Critical';
                break;
            case 'C':
                return 'C - Normal';
                break;
            default:
                return 'NA';
                break;
        }
    }

    self.getDispSpeed = function (speed) {
        //return speed.toFixed(2) + ' km/hr';
        return '1 km/hr';
    }

    self.slideMenu = function () {
        self.showside = false;
        self.menudown = true;
    }

    function GetAllNodalAgencies(agencyType) {
        MonitoringService.getNodalAgencies(agencyType)
            .then(function (response) {
                console.log(response.data.data);
                self.allNodalAgencies = response.data.data;
                for (var i = 0; i < self.allNodalAgencies.length; i++) {
                    var obj = self.allNodalAgencies[i];
                    obj.ticked = false;
                }

            }, function (err) {
                console.log(err);
            });

    };

    function GetAllAmbulanceTypes() {

        self.allAmbulanceTypes = [];
        self.allAmbulanceTypes.push({ "id": 1, "ambulanceType": "Normal" });
        self.allAmbulanceTypes.push({ "id": 1, "ambulanceType": "Contagious" });
        self.allAmbulanceTypes.push({ "id": 1, "ambulanceType": "Life support" });

        for (var i = 0; i < self.allAmbulanceTypes.length; i++) {
            var obj = self.allAmbulanceTypes[i];
            obj.ticked = false;
        }

    };

    self.ambulanceRequi = function () {
        $state.go('home.amb_requi');
    }

    self.cancelBooking = function () {
        self.cancelling = true;
        var payload = $sessionStorage.selectedAmbulanceNo;

        AmbulanceService.cancelBooking(payload).then(
             function (response) {
                 console.log('response after cancelling', response);

                 $timeout(function () {
                     refreshAmbulanceData();
                 }, 500);
             },
             function (err) {
                 //console.log('get all stops in run failed.');
                 console.log(err);
             }
         );
    }

    $scope.loadVehiclesAsync = function (search) {
        $scope.refresing = true;
        console.log('search', search);
        //var filteredList = $filter('filter')($localStorage.vehicleNos, { vehicleRegNo: search });
        MonitoringService.getMatchingVehicleNos('ambulance', search).then(function (response) {
            self.allRegnNos = response.data.data;
            $scope.refresing = false;

        }, function (err) {
            console.log(err);
        });


    }

    function getSelectedRegnNos() {
        var arr = [];

        if (self.selectedRegnNos !== null && !angular.isUndefined(self.selectedRegnNos)) {
            if (angular.isArray(self.selectedRegnNos)) {
                arr = self.selectedRegnNos.map(function (r) {
                    return r.vehicleRegNo;
                });

            } else {
                if (!angular.isUndefined(self.selectedRegnNos.vehicleRegNo))
                    arr = [self.selectedRegnNos.vehicleRegNo];
            }
        }

        return arr;
    }
}
