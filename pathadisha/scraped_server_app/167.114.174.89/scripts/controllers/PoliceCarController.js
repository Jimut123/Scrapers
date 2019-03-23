/**
 * Created by Debkumar on 19-Sept-17.
 */

var stop_name;
angular.module('controlPanelApp').controller('PoliceCarController', PoliceCarController);

function PoliceCarController(PoliceCarService, MonitoringService, $interval, $timeout, $filter, $rootScope, $localStorage, leafletData, $state, $sessionStorage, $scope) {
    var self = this;
    //scope variable declaration
    self.msg = '';
    self.startTime = new Date();
    self.isSaving = false;
    self.showside = false;
    self.menudown = false;
    self.selectedPoliceStations = [];
    self.selectedPoliceCarCategories = [];
    self.selectedRegnNos = [];

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

    if ($localStorage.polcarMapCenter !== null && typeof ($localStorage.polcarMapCenter) !== 'undefined') {
        self.map.center = $localStorage.polcarMapCenter;
    } else {
        self.map.center = { lat: 22.585167, lng: 88.380374, zoom: 12 };
    }
	
	refreshPolcarData();

    function isEqual(actual, expected) { 
		return angular.equals(actual, expected) 
	};

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
	

    function refreshPolcarData() {
		
        leafletData.getMap().then(function (map) {
            var bnds = map.getBounds();
            var payload = {
				"policeStations": self.selectedPoliceStations.map(function (r) {
					return r.name;
				}),
				"policeCarCategories": self.selectedPoliceCarCategories.map(function (r) {
					return r.policeCarCategory;
				}),
                "vehicleNos": getSelectedRegnNos(),
				"vehicleTypes": ["POLICECAR"],
                "pointNW": {
                    "latitude": bnds._northEast.lat,
                    "longitude": bnds._southWest.lng
                },
                "pointSE": {
                    "latitude": bnds._southWest.lat,
                    "longitude": bnds._northEast.lng
                }
            };
			//console.log("payload", payload);
			
            MonitoringService.getPolcarPosition(payload).then(
                function (response) {
                    self.polcarList = getFlteredPolcar(response.data.data);
                    drawPolcarOnMap(self.polcarList);
                },
                function (err) {
                    console.log(err);
                }
            );

        });
        
    }

    function getFlteredPolcar(polcarList) {
		return polcarList;
    }

    function drawPolcarOnMap(polcarList) {
        var mapMarkers = {};

        for (var i = 0; i < polcarList.length; i++) {
            var item = polcarList[i];
            var key = item.vehicleNo;
            if (item.vehicleType.toUpperCase() === "POLICECAR") {
                mapMarkers[key] = createPolcarMarker(item, false);
            }
        }

        self.map.markers = mapMarkers;
        
        if (typeof ($sessionStorage.polcarReqiNo) !== 'undefined' && $sessionStorage.polcarReqiNo !== null) {
            
            var markerPolcar = self.map.markers[$sessionStorage.polcarReqiNo];
            self.selectedVehicle = markerPolcar;
            //self.map.center = { lat: markerAmbulance.lat, lng: markerAmbulance.lng, zoom: 16 };
            $sessionStorage.polcarReqiNo = null;
        }

        if (self.selectedVehicle != null) {
            var existingMarker = self.map.markers[self.selectedVehicle.label.options.data.vehicleNo];
            setSelectedVehicle(existingMarker);
            self.map.center = { lat: existingMarker.lat, lng: existingMarker.lng, zoom: self.map.center.zoom };

            setSideDisplayData(existingMarker);
        }
	}
	
    function setSideDisplayData(markerPolcar) {
        self.sidedispData = {
            vehicleNo: markerPolcar.label.options.data.vehicleNo,
            latitude: markerPolcar.lat,
            longitude: markerPolcar.lng,
            nodalAgencyName: (typeof(markerPolcar.label.options.data.vehicle.nodalAgency)) !== 'undefined' ? markerPolcar.label.options.data.vehicle.nodalAgency.nodalAgencyName : '',
			policeStation: (typeof(markerPolcar.label.options.data.vehicle.vehicleDetail) !== 'undefined' ? markerPolcar.label.options.data.vehicle.vehicleDetail.policeStation : ''),
			policeCarCategory: (typeof(markerPolcar.label.options.data.vehicle.vehicleDetail) !== 'undefined' ? markerPolcar.label.options.data.vehicle.vehicleDetail.category : ''),
            driverName: (typeof(markerPolcar.label.options.data.vehicle.vehicleAdditionalInfo) !== 'undefined' ? markerPolcar.label.options.data.vehicle.vehicleAdditionalInfo.driverName : ''),
            driverPhoneNo: (typeof(markerPolcar.label.options.data.vehicle.vehicleAdditionalInfo) !== 'undefined' ? markerPolcar.label.options.data.vehicle.vehicleAdditionalInfo.driverPhoneNo : '')
        };

        self.showside = true;
    }

    function setSelectedVehicle(marker) {

        var item = { lastLocation: { latitude: 0, longitude: 0 } };
        item.lastLocation.latitude = marker.lat;
        item.lastLocation.longitude = marker.lng;
        item.vehicleNo = marker.label.options.data.vehicleNo;
        item.lastTime = marker.label.options.data.lastTime;
        item.angle = marker.label.options.data.angle;
        item.vehicle = marker.label.options.data.vehicle;
        self.map.markers[marker.label.options.data.vehicleNo] = createPolcarMarker(item, true);
    }

    function setDeSelectedVehicle(marker) {

        var item = { "lastLocation" : { latitude: 0, longitude: 0 } };
        item.lastLocation.latitude = marker.lat;
        item.lastLocation.longitude = marker.lng;
        item.vehicleNo = marker.label.options.data.vehicleNo;
        item.lastTime = marker.label.options.data.lastTime;
        item.angle = marker.label.options.data.angle;
        item.vehicle = marker.label.options.data.vehicle;
        self.map.markers[marker.label.options.data.vehicleNo] = createPolcarMarker(item, false);
    }
	
    function createPolcarMarker(item, isSelected) {
      
        var className = 'polcar_marker_icon';
        var imgAngle = 0;

		if (item.vehicle.vehicleDetail != null) {
			//console.log(item.vehicle);
			var vehicleInfo = item.vehicle.vehicleDetail;
			if (typeof(vehicleInfo) !== 'undefined' && vehicleInfo.category !== null) {
				className = 'policecar_' + vehicleInfo.category.toLowerCase();
			}
		}
		
		//"<div>test</div>"
        //var htmlMarker = "<div>" + "test" + "</div>";
        //console.log(htmlMarker);
		var _displayString = "";
		if(typeof(vehicleInfo) !== 'undefined' && typeof(vehicleInfo.category) !== 'undefined'){
			_displayString = vehicleInfo.category.toUpperCase();
		}
		
        var val = {
            title: '',
            lat: item.lastLocation.latitude,
            lng: item.lastLocation.longitude,
            focus: false,
            draggable: false,
            icon: {
                type: 'div',
                className: className,
                iconSize: [38, 38],
				iconAnchor: [Math.round(38 / 2), 38],
                popupAnchor: [0, -10],
                iconAngle: 120,
                html: "<div>" + _displayString + "</div>"
            },
            label: {
                options: {
                    data: {
                        "type": "policecar",
                        "contact": item.contactNo,
                        "vehicleNo": item.vehicleNo,
                        "lastTime": item.lastTime,
                        "lastLocation": item.lastLocation,
                        "speed": item.speed,
                        "angle": item.angle,
                        "vehicle": item.vehicle
                    }
                }
            }
        };

        return val;
    }
	

    if (threadVar !== null || typeof threadVar !== 'undefined')
        clearInterval(threadVar);

    threadVar = setInterval(refreshPolcarData, 1000 * 10);
	
	/*
    refreshPolcarData();
    $interval(refreshPolcarData, 10 * 1000); //refresh every 10 seconds
	*/
	
	/*
    $rootScope.$on('$viewContentLoaded', function (event) {
        // code that will be executed ... 
        // every time this view is loaded
        console.log('viewContentLoaded', true);
        $timeout(function () {
            refreshPolcarData();
        }, 5 * 1000);

    });	
	*/
	
    GetAllPoliceStation("HOWRAH CITY POLICE");
    //GetAllRegnNos("policecar");
	GetPoliceCarCategory("HOWRAH CITY POLICE");
	
    function GetPoliceCarCategory(agencyName) {
		console.log('within police station fetch');
		if ($sessionStorage.policeCarCategories === null || typeof $sessionStorage.policeCarCategories === 'undefined') {
			$sessionStorage.policeCarCategories = [
				{"policeCarCategory": "HRFS", "policeCarCategoryName": "HRFS", "ticked": false}, 
				{"policeCarCategory": "RFS", "policeCarCategoryName": "RFS", "ticked": false}, 
				{"policeCarCategory": "QRT", "policeCarCategoryName": "QRT", "ticked": false}, 
				{"policeCarCategory": "RTM", "policeCarCategoryName": "RT-Mobile", "ticked": false}, 
				{"policeCarCategory": "NBN", "policeCarCategoryName": "NABANNA", "ticked": false}
				];
		}
		self.allPoliceCarCategory = $sessionStorage.policeCarCategories;
	};
    
    function GetAllPoliceStation(agencyName) {
        console.log('within police station fetch');
        if ($sessionStorage.policeStations === null || typeof $sessionStorage.policeStations === 'undefined') {
        	PoliceCarService.getPoliceStation(agencyName)
                .then(function (response) {
                    if (response.data.data !== null && angular.isDefined(response.data.data)) {
                        $sessionStorage.policeStations = response.data.data;
                        //self.allPoliceStations = $sessionStorage.policeStations;
                        for (var i = 0; i < $sessionStorage.policeStations.length; i++) {
                            var obj = $sessionStorage.policeStations[i];
                            obj.ticked = false;
                        }

                        self.allPoliceStations = $sessionStorage.policeStations;
                    }
                    
                }, function (err) {
                    console.log(err);
                });
        } else {
            self.allPoliceStations = $sessionStorage.policeStations;
        }
    };
    
    // function GetAllRegnNos(vehicleType) {
    //     console.log('within poice vehicle regn no fetch');
    //     if ($sessionStorage.policecarVehicleNos === null || typeof $sessionStorage.policecarVehicleNos === 'undefined') {
    //         MonitoringService.geVehicleNos(vehicleType)
    //             .then(function (response) {
    //                 //console.log(response.data.data);
    //                 $sessionStorage.policecarVehicleNos = response.data.data;
    //                 self.allRegnNos = $sessionStorage.policecarVehicleNos;
    //             }, function (err) {
    //                 console.log(err);
    //             });
    //     } else {
    //         self.allRegnNos = $sessionStorage.policecarVehicleNos;
    //     }
    // };
    
    self.slideMenu = function () {
        self.showside = false;
        self.menudown = true;
    };
    

    $rootScope.$on('leafletDirectiveMap.map.dragend', function (event, args) {
        //console.log('within drag end');
        //console.log(self.map.center);
        $localStorage.polcarMapCenter = self.map.center;
        
    });

    $rootScope.$on('leafletDirectiveMap.map.zoomstart', function (event, args) {
       // console.log('within zoom start');
    });

    $rootScope.$on('leafletDirectiveMap.map.zoomend', function (event, args) {
        // console.log('within zoom end');
        $localStorage.polcarMapCenter = self.map.center;
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

        var markerPolcar = self.map.markers[args.modelName];
        setSideDisplayData(markerPolcar);

        if (!self.showside)
            self.showside = true;

        self.selectedVehicle = markerPolcar;
        var existingMarker = self.map.markers[self.selectedVehicle.label.options.data.vehicleNo];
        setSelectedVehicle(existingMarker);
    });	

    $scope.loadVehiclesAsync = function (search) {
        $scope.refresing = true;
        console.log('search', search);
        //var filteredList = $filter('filter')($localStorage.vehicleNos, { vehicleRegNo: search });
        MonitoringService.getMatchingVehicleNos('policecar', search).then(function (response) {
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


