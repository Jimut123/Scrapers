angular.module('controlPanelApp').controller('VehicleLocModalController', VehicleLocModalController);

function VehicleLocModalController($scope, MonitoringService, $timeout, Constants, leafletData, parent, $uibModalInstance, locObj, tracking, $rootScope, MiscServices) {


    this.parent = parent;

    this.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.zoomLevel = Constants.MODAL_MAP_ZOOM;
    var pathArray = [];
    console.log('locObj', locObj);

    //if (angular.isUndefined(locObj.eventLocation)) {
    //    if (!angular.isUndefined(locObj.lastAddress)) {
    //        locObj.eventLocation = locObj.lastAddress;
    //    }
    //}

    //if (angular.isUndefined(locObj.vehicleNo)) {
    //    if (!angular.isUndefined(locObj.vehicleRegNo)) {
    //        locObj.vehicleNo = locObj.vehicleRegNo;
    //    }
    //}

    $scope.focus = false;

    $scope.map = {
        defaults: {
            tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            maxZoom: 18,
            minZoom: 8,
            doubleClickZoom: true,
            zoomControlPosition: 'bottomleft',
            zoomControl: true
        },
        markers: {},
        paths: {},
        bounds: {},
        center: {},
        events: {
            map: {
                enable: ['zoomstart', 'zoomend', 'dragstart', 'dragend', 'click', 'moveend', 'movestart'],
                disable: ['dblclick', 'mousemove'],
                logic: 'emit',
            },
            markers: {
                enable: ['click', 'contextmenu', 'popupopen', 'popupclose'],
                logic: 'emit',
            }
        }
    };

    $scope.map.center = Constants.DefaultBound;

    //start tracking
    if (tracking) {
        drawVehicleOnMap(locObj, false);
        //console.log('with tracking');
        $scope.selectedVehicleNo = locObj.vehicleNo;
        trackVehicle();

        if (threadVar !== null || typeof threadVar !== 'undefined')
            clearInterval(threadVar);
        threadVar = setInterval(trackVehicle, 1000 * Constants.ONLINE_STATUS_CHECK_INTERVAL);

    } else {
        //console.log('with out tracking');
        //drawVehicleOnMap(locObj, false);
        $scope.selectedVehicleNo = locObj.vehicleNo;
        trackVehicle();
    }


    $scope.$on('leafletDirectiveMap.map.dragend', function (event, args) {
        
        //self.selectedBound = $scope.map.bounds;
        $scope.zoomLevel = $scope.map.center.zoom;
    });

    $scope.$on('leafletDirectiveMap.map.zoomend', function (event, args) {
        //console.log($scope.map.bounds);
        $scope.zoomLevel = $scope.map.center.zoom;
    });

    $scope.$on('leafletDirectiveMarker.map.click', function (event, args) {

       
        if (!angular.isUndefined(args.modelName)) {

            var vehicleMarker = $scope.map.markers[args.modelName];
            if (!angular.isUndefined(vehicleMarker)) {

                $scope.focus = !vehicleMarker.focus;
            }
        }
       
    });


    $scope.$on('leafletDirectiveMarker.map.popupopen', function (event, args) {
        //console.log('I am open!');
        $scope.focus = true;
       
    });

    $scope.$on('leafletDirectiveMarker.map.popupclose', function (event, args) {
        //console.log('I am close!');
        $scope.focus = false;

    });


    function trackVehicle() {
        //track vehicle with current location
        var payload = {
            vehicleNos: [$scope.selectedVehicleNo],
        };
        MonitoringService.getVehicleStatusByFilter(payload).then(
          function (response) {
              if (response.data.data !== null && response.data.data.length > 0) {
                  var item = response.data.data[0];
                  drawVehicleOnMap(item, true);

              }

          },
          function (err) {

          }
      );
    }


    function drawVehicleOnMap(item, directionAvalable) {

        //if (item == null || item.lastLocation == null) return;

        drawVehicleMarkerOnMap(item)

        var boundArr = getMapBoundaries($scope.map.bounds);
        //determine whether current position within boundary or not. If out side of boundary then set center.
        var inSide = isPointInsidePolygon(item.lastLocation.latitude, item.lastLocation.longitude, boundArr);
        if (!inSide) {
            $timeout(function () {
                $scope.map.center = { lat: item.lastLocation.latitude, lng: item.lastLocation.longitude, zoom: $scope.map.center.zoom };
            }, 250);
        }

        $timeout(function () {
            leafletData.getMap().then(function (map) {
                map.invalidateSize();
            }, 500);
        });
        
    }

    function drawVehicleMarkerOnMap(item) {

        var mapMarkers = {};

        var crowdStatus = "NA";
        var vehicleType = "BUS";
        var className = "bus_n";

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

        if ($scope.showOutOfPath === true && item.outOfPath === true)
            className = 'pulsating_' + className;

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

        mapMarkers[key] = val;

        $timeout(function () {
            $scope.map.markers = mapMarkers;
        }, 0);
       
    }
   

    function drawRedrawPath() {
        $timeout(function () {
            $scope.map.paths = { p1: { color: '#008000', weight: 4, latlngs: pathArray } };
        }, 100);
    }

    function generateHtmlMessage(item) {
        var message = '';
        //message = message + "<div class='row'><div class='col-xs-3 text-bold'>" + "Vehicle: " + "</div><div class='col-xs-9'>" + item.vehicleNo + "</div></div>";

        //if (typeof (item.eventLocation) !== 'undefined' && item.eventLocation !== null) {
        //    message = message + "<div class='row'><div class='col-xs-3 text-bold'>" + "Location: " + "</div><div class='col-xs-9'>" + " " + item.eventLocation + "</div></div>";
        //}

        //////journeyId
        ////if (!angular.isUndefined(item.journeyId) && item.journeyId != null && item.journeyId != "" && item.journeyId != "0") {
        ////    message = message + "<div class='row'><div class='col-xs-2 text-bold'>" + "Trip: " + "</div><div class='col-xs-10'>" + item.journeyId + "</div></div>";
        ////}

        //if (!angular.isUndefined(item.vehicleStatus)) {
        //    message = message + "<div class='row'><div class='col-xs-3 text-bold'>" + "Status: " + "</div><div class='col-xs-9'>" + item.vehicleStatus + "</div></div>";
        //}

        //if (!angular.isUndefined(item.speed)) {
        //    message = message + "<div class='row'><div class='col-xs-3 text-bold'>" + "Speed: " + "</div><div class='col-xs-9'>" + item.speed.toFixed(2) + ' km/h' + "</div></div>";
        //}

        ////distance, waitCharge, waitTime, fare
        
        //if (!angular.isUndefined(item.distance) && item.distance > threasoldValToDisplay) {
        //    message = message + "<div class='row'><div class='col-xs-3 text-bold'>" + "Distance: " + "</div><div class='col-xs-9'>" + item.distance + ' km' + "</div></div>";
        //}

        //if (!angular.isUndefined(item.waitCharge) && item.waitCharge > threasoldValToDisplay) {
        //    message = message + "<div class='row'><div class='col-xs-3 text-bold text-nowrap'>" + "Wait Time: " + "</div><div class='col-xs-3'>" + secsToTimeStringLong(item.waitTime) + "</div>";
        //    message = message + "<div class='col-xs-3 text-bold text-nowrap'>" + "Wait Charge: " + "</div><div class='col-xs-3'>" + Constants.RUPEES + item.waitCharge.toFixed(2) + "</div></div>";
        //}


        //if (!angular.isUndefined(item.fare) && item.fare > threasoldValToDisplay) {
        //    message = message + "<div class='row'><div class='col-xs-3 text-bold'>" + "Fare: " + "</div><div class='col-xs-9'>" + Constants.RUPEES + item.fare.toFixed(2) + "</div></div>";
        //}

        //message = message + "<div class='row'>"
        //if (!angular.isUndefined(item.lastStatus)) {
        //    //check both last status and gps status.
        //    var imgpath = $rootScope.statusImageGps(item);
        //    var tooltip = $rootScope.statusImageGpsTooltip(item);
        //    message = message + "<div class='col-xs-3 text-bold'>" + "GPS: " + "</div><div class='col-xs-3'>"
        //    message = message + "<img src=" + imgpath + " title=" + tooltip.replaceAll(" ", "&nbsp;") + " height='16' /></div>"


        //}
        //else if (!angular.isUndefined(item.gpsStatus)) {
        //    var arr = getImageAndTooltip(item, "gpsStatus");
        //    message = message + "<div class='col-xs-3 text-bold'>" + "GPS: " + "</div><div class='col-xs-3'>"
        //    message = message + "<img src=" + arr[0] + " title=" + arr[1] + " height='16' /></div>"


        //}

        //if (!angular.isUndefined(item.ignitionStatus)) {
        //    var arr = getImageAndTooltip(item, "ignitionStatus");
        //    message = message + "<div class='col-xs-3 text-bold'>" + "Ignition: " + "</div><div class='col-xs-3'>"
        //    message = message + "<img src=" + arr[0] + " title=" + arr[1] + " height='16' /></div>"
           

        //}
        //message = message + "</div>";

        //message = message + "<div class='row'>";
        //if (!angular.isUndefined(item.panic)) {
        //    var arr = getImageAndTooltip(item, "panic");
        //    message = message + "<div class='col-xs-3 text-bold'>" + "Panic: " + "</div><div class='col-xs-3'>"
        //    message = message + "<img src=" + arr[0] + " title=" + arr[1] + " height='16' /></div>"
        //}
        //if (!angular.isUndefined(item.tampered)) {
        //    var arr = getImageAndTooltip(item, "tampered");
        //    message = message + "<div class='col-xs-3 text-bold'>" + "Tampered: " + "</div><div class='col-xs-3'>"
        //    message = message + "<img src=" + arr[0] + " title=" + arr[1] + " height='16' /></div>"
        //}
        //message = message + "</div>";

        return message;
    }

    function getImageAndTooltip(record, type) {
        var arrValue = [];
        //var imgPath = '../../../images/red_icon.png';
        //var tooltipText = 'Unknown';

        //switch (type) {
        //    case "gpsStatus":
        //        if (record.gpsStatus != null) {
        //            if (record.gpsStatus.toUpperCase() == 'VALID') {
        //                imgPath = '../../../images/green_icon.png';
        //                tooltipText = record.gpsStatus;
        //            } else if (record.gpsStatus.toUpperCase() == 'ASSISTED') {
        //                imgPath = '../../../images/yellow_icon.png';
        //                tooltipText = record.gpsStatus;
        //            } else {
        //                imgPath = '../../../images/red_icon.png';
        //                tooltipText = record.gpsStatus;
        //            }
        //        }
        //        break;
        //    case "ignitionStatus":
        //        if (record.ignitionStatus != null) {
        //            if (record.ignitionStatus.toUpperCase() == 'ON') {
        //                imgPath = '../../../images/green_icon.png';
        //                tooltipText = record.ignitionStatus;
        //            } else {
        //                imgPath = '../../../images/red_icon.png';
        //                tooltipText = record.ignitionStatus;
        //            }
        //        }
        //        break;
        //    case "tampered":
        //        if (record.tampered != null) {
        //            if (!record.tampered) {
        //                imgPath = '../../../images/green_icon.png';
        //                tooltipText = "Not in tampered";
        //            } else {
        //                imgPath = '../../../images/yellow_icon.png';
        //                tooltipText = "Tampered";
        //            }
        //        }
        //        break;

        //    case "panic":
        //        if (record.panic != null) {
        //            if (!record.panic) {
        //                imgPath = '../../../images/green_icon.png';
        //                tooltipText = "Not in panic";
        //            } else {
        //                imgPath = '../../../images/red_icon.png';
        //                tooltipText = "Panic";
        //            }
        //        }
        //        break;
        //}

        //arrValue.push(imgPath);
        //arrValue.push(tooltipText.replaceAll(" ", "&nbsp;"));

        return arrValue;
    }
}