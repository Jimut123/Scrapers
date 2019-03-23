/**
 * Created by Ideation on 24-01-2017.
 */

angular.module('controlPanelApp').controller('DashboardController', DashboardController);

function DashboardController(DashboardService, SessionService, AuthService, $state, md5, MonitoringService, $interval, $transitions, $localStorage, $filter, $scope, $window, $sessionStorage, $rootScope, Constants) {
    var self = this;
    self.userFullName = SessionService.getUserFullName();

    var navbarHeight = angular.element(".navbar")[0].offsetHeight;
    $scope.dashBoardHeight = window.innerHeight - navbarHeight - (window.innerHeight / 10);
    $scope.chartBoxHeight = Math.ceil($scope.dashBoardHeight / 2) - 2;

    $scope.liveCountHeight = Math.ceil($scope.dashBoardHeight * 10 / 100);
    $scope.liveChartHeight = Math.ceil($scope.dashBoardHeight * 25 / 100) - 10;
    $scope.tableHeight = Math.ceil($scope.dashBoardHeight * 65 / 100) - 10;

    console.log('$scope.tableHeight', $scope.tableHeight);

    self.finishloadingVehicleTypeData = false;
    self.finishloadingVehicleSource = false;
    self.finishloadingPathViolation = false;
    self.finishloadingVehicleAgency = false;
    self.finishloadingVehicleRunninData = false;

    self.isRouteDtsShow = false;

    self.filterField = '';
    self.searchString = '';

    self.summaryKey = '';
    self.summaryGroup = '';

    self.filterCaption = 'List of Vehicles';

    self.textHighlight = 'bg-success';

    //  menu items
    self.dashboardMenu = SessionService.getAccessAuthorization('dashboardMenu');

    self.monMainMenu = SessionService.getAccessAuthorization('monMainMenu');
    self.mapViewMenu = SessionService.getAccessAuthorization('mapViewMenu');
    self.tableViewMenu = SessionService.getAccessAuthorization('tableViewMenu');
    self.monAmbMenu = SessionService.getAccessAuthorization('monAmbMenu');
    self.monPolCarMenu = SessionService.getAccessAuthorization('monPolCarMenu');

    self.monferryMenu = SessionService.getAccessAuthorization('monferryMenu');

    self.monAmbSingleMenu = SessionService.getAccessAuthorization('monAmbSingleMenu');

    self.reportMainMenu = SessionService.getAccessAuthorization('reportMainMenu');
    self.tripCountMenu = SessionService.getAccessAuthorization('tripCountMenu');
    self.tripTimeMenu = SessionService.getAccessAuthorization('tripTimeMenu');
    self.crowdMenu = SessionService.getAccessAuthorization('crowdMenu');
    self.latestPingMenu = SessionService.getAccessAuthorization('latestPingMenu');
    self.etaVsAtaMenu = SessionService.getAccessAuthorization('etaVsAtaMenu');
    self.busCrossedStopMenu = SessionService.getAccessAuthorization('busCrossedStopMenu');
    self.busCrossedNodeMenu = SessionService.getAccessAuthorization('busCrossedNodeMenu');
    self.busDataPacketMenu = SessionService.getAccessAuthorization('busDataPacketMenu');
    self.busTripMenu = SessionService.getAccessAuthorization('busTripMenu');
    self.busMovementMenu = SessionService.getAccessAuthorization('busMovementMenu');
    self.routeAllocReportMenu = SessionService.getAccessAuthorization('routeAllocReportMenu');


    self.manageMenu = SessionService.getAccessAuthorization('manageMenu');
    self.userManageMenu = SessionService.getAccessAuthorization('userManageMenu');
    self.pisManageMenu = SessionService.getAccessAuthorization('pisManageMenu');

    self.refreshPromise = null;

    self.vehiclesCountAtTable = 0;
    $scope.isFiltered = false;
    self.timeZone = 'Asia/Kolkata';
    close_splash_screen();
    $rootScope.noDataFoundText = Constants.NO_DATA_FOUND;
    $rootScope.loadingText = Constants.LOADING;

    $rootScope.allVTUs = [{ "dataSource": "TRIMAX", "ticked": false }, { "dataSource": "IDEATION", "ticked": false }, { "dataSource": "RILJIO-VTS", "ticked": false }, { "dataSource": "Chemito-VTU", "ticked": false }, { "dataSource": "Chalo-VTU", "ticked": false }];
    GetAllAgencies();


    self.fetchStats = function (refreshFlag) {

        console.log('fetchStats', "Arnab");

        var arrDeviceType = [];
        var arrVtu = [];
        var arrPath = [];
        var arrAgency = [];

        console.log('fetching');
        DashboardService.getDashboardStats(self.timeZone).then(
            function (summaryResponse) {
                self.summaryDataList = summaryResponse.data.data;
                self.summaryData = {};
                for (var i = 0; i < self.summaryDataList.length; i++) {
                    self.summaryData[self.summaryDataList[i].summaryKey] = self.summaryDataList[i].summaryValue;
                }
                self.summaryData['calulatedAt'] = self.summaryDataList[0].calulatedAt;
            },
            function (error) {
                console.log(error);
            });

        DashboardService.getStatistics(self.timeZone).then(
                function (response) {


                    var data = response.data.data;
                    console.log("getStatistics", data);
                    var dataSource = {}, type = {}, crowdStatusBus = {}, crowdStatusAmbulance = {}, outOfPath = {}, agency = {};
                    for (var i = 0; i < data.length; i++) {
                        var obj = data[i];
                        if (obj.summaryGroup == null || obj.summaryGroup == undefined)
                            continue;
                        switch (obj.summaryGroup) {
                            case "DATA_SOURCE":
                                dataSource[self.getDisplayLegend('vtu', obj.summaryKey)] = obj.summaryValue;
                                arrVtu.push({
                                    vehicleSource: obj.summaryKey,
                                    count: obj.summaryValue
                                });
                                break;
                            case "VEHICLE_TYPE":
                                type[self.getDisplayLegend('vehicle', obj.summaryKey)] = obj.summaryValue;
                                arrDeviceType.push({
                                    vehicle: obj.summaryKey,
                                    count: obj.summaryValue
                                });
                                break;
                            case "BUS_CROWD":
                                crowdStatusBus[self.getDisplayLegend('bus_crowd', obj.summaryKey)] = obj.summaryValue;
                                break;
                            case "AGENCY":

                                agency[self.getDisplayLegend('agency', obj.summaryKey)] = obj.summaryValue;
                                /// ***************
                                arrAgency.push({
                                    agency: obj.summaryKey,
                                    count: obj.summaryValue
                                });
                                ///************* after agency api , need to change *************

                                break;
                            case "AMBULANCE_CROWD":
                                crowdStatusAmbulance[self.getDisplayLegend('ambulance_crowd', obj.summaryKey)] = obj.summaryValue;
                                break;
                            case "PATH_VIOLATION":
                                outOfPath[self.getDisplayLegend('path', obj.summaryKey)] = obj.summaryValue;
                                arrPath.push({
                                    vehiclePath: obj.summaryKey,
                                    count: obj.summaryValue
                                });
                                break;

                        }
                    }


                    self.totalLiveCount = response.data.totalRecordCount;

                    generateChart(arrDeviceType, arrVtu, arrPath, arrAgency);

                    self.liveStatus = {
                        dataSource: { labels: Object.keys(dataSource), data: Object.values(dataSource) },
                        vehicleType: { labels: Object.keys(type), data: Object.values(type) },


                        crowdStatusBus: { labels: Object.keys(crowdStatusBus), data: Object.values(crowdStatusBus) },
                        crowdStatusAmbulance: { labels: Object.keys(crowdStatusAmbulance), data: Object.values(crowdStatusAmbulance) },
                        outOfPath: { labels: Object.keys(outOfPath), data: Object.values(outOfPath) },
                        agency: { labels: Object.keys(agency), data: Object.values(agency) },
                    };


                    if (refreshFlag == '1') {
                        //getTableDetails($scope.tableState);
                        self.callServer();
                    }
                    //self.totalLiveCount = response.data.data.length;
                },
                function (error) {
                    console.log(error);
                }
            );
    };


    function generateVehicleRunningChart() {

        var arrowColor = "#CC0000";
        if (self.totalLiveCount > 0 && self.totalLiveCount <= 600) {
            arrowColor = "#4caf50";
            //self.textHighlight='bg-success';
            //angular.element(document.querySelector("#spnNoofVehs")).addClass("bg-success");
        }
        if (self.totalLiveCount > 600 && self.totalLiveCount <= 1500) {
            arrowColor = "#fdd400";
            //self.textHighlight='bg-yellow';
            //angular.element(document.querySelector("#spnNoofVehs")).addClass("bg-yellow");
        }
        if (self.totalLiveCount > 1500) {
            arrowColor = "#cc4748";
            //self.textHighlight='bg-red';
            //angular.element(document.querySelector("#spnNoofVehs")).addClass("bg-red");
        }

        var gaugeChart;
        gaugeChart = AmCharts.makeChart("chartByVehicleRunning", {
            "type": "gauge",
            "theme": "light",

            "axes": [{
                "axisThickness": 1.5,
                "axisAlpha": 0.5,
                "tickAlpha": 1.5,
                "valueInterval": 2000,
                "bands": [{
                    "color": "#4caf50",
                    "endValue": 600,
                    "innerRadius": "75%",
                    "startValue": 0
                }, {
                    "color": "#fdd400",
                    "endValue": 1500,
                    "innerRadius": "75%",
                    "startValue": 600
                }, {
                    "color": "#cc4748",
                    "endValue": 4000,
                    "innerRadius": "75%",
                    "startValue": 1500
                }],
                // "bottomText": self.totalLiveCount,
                "bottomTextYOffset": -20,
                "endValue": 4000
            }],
            "arrows": [
				{
				    "value": self.totalLiveCount,
				    "color": arrowColor,
				    "nailRadius": 4,
				    "startWidth": 3,
				    "innerRadius": 0,
				    "clockWiseOnly": true,
				    "nailAlpha": 1,
				}
            ]
        });

    }


    function generateChart(arrDeviceType, arrVtu, arrPath, arrAgency) {

        self.finishloadingVehicleTypeData = true;
        self.vehicleTypeOptions.data = arrDeviceType;
        $scope.$broadcast('amCharts.updateData', self.vehicleTypeOptions.data, 'chartByVehicleType');

        self.finishloadingVehicleSource = true;
        self.vehicleSourceOptions.data = arrVtu;
        $scope.$broadcast('amCharts.updateData', self.vehicleSourceOptions.data, 'chartByVehicleSource');


        self.finishloadingPathViolation = true;
        self.vehiclePathViolationOptions.data = arrPath;
        $scope.$broadcast('amCharts.updateData', self.vehiclePathViolationOptions.data, 'chartvehiclePathViolation');

        self.finishloadingVehicleAgency = true;
        self.vehicleAgencyOptions.data = arrAgency;
        $scope.$broadcast('amCharts.updateData', self.vehicleAgencyOptions.data, 'chartvehicleByAgency');

    }

    self.vehicleTypeOptions = {
        "data": [{ count: 0, vehicle: ' ' }],
        "fontFamily": "Roboto,Helvetica Neue,Helvetica,Arial,sans-serif",
        "autoMargins": false,
        "marginTop": 10,
        "marginBottom": 10,
        "marginLeft": 0,
        "marginRight": 0,
        "pullOutRadius": 2,
        "type": "pie",
        "theme": "light",
        "innerRadius": "40%",
        "gradientRatio": [-0.4, -0.4, -0.4, -0.4, -0.4, -0.4, 0, 0.1, 0.2, 0.1, 0, -0.2, -0.5],
        "labelRadius": -25,
        "labelText": "[[percents]]%",
        "legend": {
            "position": "right",
            "marginRight": 100,
            "autoMargins": false,
            "marginTop": 20,
            "markerSize": 10,
        },
        "valueField": "count",
        "titleField": "vehicle",
        "colorField": "color",
        "balloonText": "[[vehicle]]: [[count]]",
        "balloon": {
            "adjustBorderColor": true,
            "color": "#000000",
            "cornerRadius": 5,
            "fillColor": "#FFFFFF",
        },
        "listeners": [{
            "event": "clickSlice",
            "method": function (e) {
                var dp = e.dataItem.dataContext
                console.log("clickSlice", dp);

                self.summaryKey = dp.vehicle
                self.summaryGroup = "VEHICLE_TYPE";

                //getTableDetails($scope.tableState);
                self.callServer();

                self.filterCaption = "Vehicles by Type" + " - " + dp.vehicle;

            }
        }, {
            "event": "drawn",
            "method": addLegendLabelVT
        }
        ]
    }

    function addLegendLabelVT(e) {
        var title = document.createElement("div");
        title.innerHTML = "Vehicles by Type";
        title.className = "legend-title";
        e.chart.legendDiv.appendChild(title)
    }

    self.vehicleSourceOptions = {
        "data": [{ count: 0, vehicleSource: ' ' }],

        "fontFamily": "Roboto,Helvetica Neue,Helvetica,Arial,sans-serif",
        "autoMargins": false,
        "marginTop": 10,
        "marginBottom": 10,
        "marginLeft": 0,
        "marginRight": 0,
        "pullOutRadius": 2,
        "type": "pie",
        "theme": "light",
        "innerRadius": "40%",
        "gradientRatio": [-0.4, -0.4, -0.4, -0.4, -0.4, -0.4, 0, 0.1, 0.2, 0.1, 0, -0.2, -0.5],
        "labelRadius": -25,
        "labelText": "[[percents]]%",
        "legend": {
            "position": "right",
            "marginRight": 100,
            "autoMargins": false,
            "marginTop": 20,
            "markerSize": 10,
        },
        "valueField": "count",
        "titleField": "vehicleSource",
        "colorField": "color",
        "balloonText": "[[vehicleSource]]: [[count]]",
        "balloon": {
            "adjustBorderColor": true,
            "color": "#000000",
            "cornerRadius": 5,
            "fillColor": "#FFFFFF",
        },
        "listeners": [{
            "event": "clickSlice",
            "method": function (e) {
                var dp = e.dataItem.dataContext
                console.log("clickSlice", dp);

                self.summaryKey = dp.vehicleSource
                self.summaryGroup = "DATA_SOURCE";

                //getTableDetails($scope.tableState);
                self.callServer();
                self.filterCaption = "Vehicles by GPS Device Type" + " - " + dp.vehicleSource;

            }
        }, {
            "event": "drawn",
            "method": addLegendLabelVS
        }]
    }

    function addLegendLabelVS(e) {
        var title = document.createElement("div");
        title.innerHTML = "Vehicles by GPS Device Type";
        title.className = "legend-title";
        e.chart.legendDiv.appendChild(title)
    }

    self.vehiclePathViolationOptions = {
        "data": [{ count: 0, PathViolation: ' ' }],
        "fontFamily": "Roboto,Helvetica Neue,Helvetica,Arial,sans-serif",
        "autoMargins": false,
        "marginTop": 10,
        "marginBottom": 10,
        "marginLeft": 0,
        "marginRight": 0,
        "pullOutRadius": 2,
        "type": "pie",
        "theme": "light",
        "innerRadius": "40%",
        "gradientRatio": [-0.4, -0.4, -0.4, -0.4, -0.4, -0.4, 0, 0.1, 0.2, 0.1, 0, -0.2, -0.5],
        "labelRadius": -25,
        "labelText": "[[percents]]%",
        "legend": {
            "position": "right",
            "marginRight": 100,
            "autoMargins": false,
            "marginTop": 20,
            "markerSize": 10,
        },
        "valueField": "count",
        "titleField": "vehiclePath",
        "colorField": "color",
        "balloonText": "[[vehiclePath]]: [[count]]",
        "balloon": {
            "adjustBorderColor": true,
            "color": "#000000",
            "cornerRadius": 5,
            "fillColor": "#FFFFFF",
        },
        "listeners": [{
            "event": "clickSlice",
            "method": function (e) {
                var dp = e.dataItem.dataContext
                console.log("clickSlice", dp);

                self.summaryKey = dp.vehiclePath
                self.summaryGroup = "PATH_VIOLATION";

                //getTableDetails($scope.tableState);
                self.callServer();
                self.filterCaption = "Vehicles " + dp.vehiclePath + "";

            }
        }, {
            "event": "drawn",
            "method": addLegendLabelPV
        }]
    }

    function addLegendLabelPV(e) {
        var title = document.createElement("div");
        title.innerHTML = "Busses On/Off-Route";
        title.className = "legend-title";
        e.chart.legendDiv.appendChild(title)
    }

    self.vehicleAgencyOptions = {
        "data": [{ count: 0, agency: ' ' }],

        "fontFamily": "Roboto,Helvetica Neue,Helvetica,Arial,sans-serif",
        "autoMargins": false,
        "marginTop": 10,
        "marginBottom": 10,
        "marginLeft": 0,
        "marginRight": 0,
        "pullOutRadius": 2,
        "type": "pie",
        "theme": "light",
        "innerRadius": "40%",
        "gradientRatio": [-0.4, -0.4, -0.4, -0.4, -0.4, -0.4, 0, 0.1, 0.2, 0.1, 0, -0.2, -0.5],
        "labelRadius": -25,
        "labelText": "[[percents]]%",
        "legend": {
            "position": "right",
            "marginRight": 60,
            "autoMargins": false,
            "marginTop": 20,
            "markerSize": 10,
        },
        "valueField": "count",
        "titleField": "agency",
        "colorField": "color",
        "balloonText": "[[agency]]: [[count]]",
        "balloon": {
            "adjustBorderColor": true,
            "color": "#000000",
            "cornerRadius": 5,
            "fillColor": "#FFFFFF",
        },
        "listeners": [{
            "event": "clickSlice",
            "method": function (e) {
                var dp = e.dataItem.dataContext
                console.log("clickSlice", dp);

                self.summaryKey = dp.agency
                self.summaryGroup = "AGENCY";

                //getTableDetails($scope.tableState);
                self.callServer();
                self.filterCaption = "Busses by Agency" + " - " + dp.agency;


            }
        }, {
            "event": "drawn",
            "method": addLegendLabelVA
        }]
    }

    function addLegendLabelVA(e) {
        var title = document.createElement("div");
        title.innerHTML = "Busses by Agency";
        title.className = "legend-title";
        e.chart.legendDiv.appendChild(title)
    }

    self.getDisplayLegend = function (graph, value) {
        var returnValue;
        switch (graph) {
            case 'vtu':
                returnValue = value;
                break;
            case 'vehicle':
                switch (value) {
                    case null:
                    case 'null':
                        returnValue = 'BUS';
                        break;
                    default:
                        returnValue = value;
                        break;
                }
                break;
            case 'bus_crowd':
                switch (value) {
                    case 'null':
                    case null:
                    case 'N':
                        returnValue = 'UNKNOWN';
                        break;
                    case 'M':
                        returnValue = 'MEDIUM';
                        break;
                    case 'H':
                        returnValue = 'HIGH';
                        break;
                    case 'L':
                        returnValue = 'LOW';
                        break;
                    default:
                        returnValue = value;
                        break;
                }
                break;
            case 'ambulance_crowd':
                switch (value) {
                    case 'null':
                    case null:
                    case 'N':
                        returnValue = 'UNKNOWN';
                        break;
                    case 'E':
                        returnValue = 'AVAILABLE';
                        break;
                    case 'B':
                        returnValue = 'BOOKED';
                        break;
                    case 'O':
                        returnValue = 'OCCUPIED';
                        break;
                    default:
                        returnValue = value;
                        break;
                }
                break;
            case 'path':
                switch (value) {
                    case false:
                        returnValue = 'On Path';
                        break;
                    case true:
                        returnValue = 'Out Of Path';
                        break;
                    default:
                        returnValue = value;
                        break;
                }
                break;
            default:
                returnValue = value;
                break;
        }
        return returnValue;
    }

    self.fetchStats();


    refreshPromise = $interval(function () {
        self.fetchStats('1');
    }, Constants.DASHBOARD_REFRESH_INTERVAL * 1000);


    self.logout = function () {
        AuthService.logout({ sessionToken: SessionService.getToken() }).then(
            function (response) {
                $state.transitionTo("login");
            },
            function (error) {
                $state.transitionTo("login");
            }
        )
    };

    self.initializePasswordModal = function () {
        self.changePasswordErrMsg = "";
        self.newPassword = "";
        self.newPasswordConfirm = "";
        self.oldPassword = "";
    };
    self.changePassword = function () {

        var errorCode = 0;
        var credentials = {
            userLogin: SessionService.getUserLogin(),
            userPassword: md5.createHash(self.oldPassword || '')
        };
        var credentialsNew = {
            userLogin: SessionService.getUserLogin(),
            userPassword: md5.createHash(self.newPassword || '')
        };
        AuthService.validatePassword(credentials, errorCode)
            .then(function (response) {
                if (response.status === 200) {
                    if (self.oldPassword == self.newPassword) {
                        self.changePasswordErrMsg = "New password cannot be same!";
                        console.log(self.changePasswordErrMsg);
                        $("#changePasswordModal").effect("shake");
                        return;
                    }
                    if (!(self.newPasswordConfirm == self.newPassword)) {
                        self.changePasswordErrMsg = "New passwords do not match!";
                        console.log(self.changePasswordErrMsg);
                        $("#changePasswordModal").effect("shake");
                        return;
                    }
                    if (self.newPassword.length < 5) {
                        self.changePasswordErrMsg = "Use longer password!";
                        console.log(self.changePasswordErrMsg);
                        $("#changePasswordModal").effect("shake");
                        return;
                    }
                    AuthService.changePassword(credentialsNew, errorCode)
						.then(function (response) {
						    if (response.status === 200) {
						        self.changePasswordErrMsg = "Password changed successfully.";
						        errorCode = 1;
						        $("#changePasswordModal").delay(2000).queue(function () {
						            $("#changePasswordModal").modal("hide");
						            $("#changePasswordModal").dequeue();
						        });
						        console.log(self.changePasswordErrMsg);
						        return;
						    } else {
						        self.changePasswordErrMsg = "Password change request failed.";
						        console.log(self.changePasswordErrMsg);
						        $("#changePasswordModal").effect("shake");
						    }
						}, function (err) {
						    self.changePasswordErrMsg = "Password change request failed.";
						    console.log(err);
						    $("#changePasswordModal").effect("shake");
						});

                } else {
                    self.changePasswordErrMsg = "Password change request failed.";
                    console.log(self.changePasswordErrMsg);
                    $("#changePasswordModal").effect("shake");
                }

            }, function (err) {
                self.changePasswordErrMsg = "Old password does not match.";
                console.log(err);
                $("#changePasswordModal").effect("shake");
            });


    };
    self.doughnutOptions = {
        legend: {
            display: true,
            position: 'bottom'
        }
    };

    self.chartColors = ['#5DA5DA', '#FAA43A', '#60BD68', '#B2912F', '#B276B2', '#DECF3F', '#DC524D'];

    $transitions.onStart({}, function ($transition$) {
        //stateTo === $transition$.$to();
        if ($transition$._targetState._identifier !== "home") {
            $interval.cancel(refreshPromise);
        }
    });


    /// table
    var getTableDetails = function (tableState) {
        console.log('getTableDetails');

        generateVehicleRunningChart();

        self.nodataFound = false;
        self.isLoading = true;
        var rowcount = Math.ceil($scope.tableHeight / 35);
        $scope.pageRecordCount = (rowcount < 10 ? 10 : rowcount); //$scope.pageSize.selectedSize.value;
        if (tableState != undefined) {
            var pagination = tableState.pagination;

            var start = pagination.start || 0;
            var number = $scope.pageRecordCount;
            console.log('tableState', tableState);
            tableState.pagination.numberOfPages = 0;

            var searchString = "";
            if (tableState.search.predicateObject !== null && typeof (tableState.search.predicateObject) !== 'undefined') {
                searchString = tableState.search.predicateObject.summaryKey;
            }

            var sortField = "";
            if (typeof (tableState.sort.predicate) === 'undefined') {

                sortField = "summaryKey";
            } else {
                sortField = tableState.sort.predicate;
            }
        }

        var payload = {
            "summaryGroup": self.summaryGroup,
            "summaryKey": self.summaryKey,
            "pageNo": Math.floor(start / $scope.pageRecordCount),
            "rowCount": $scope.pageRecordCount,
            "sortFileds": [
                {
                    "fieldName": sortField,
                    "sortOrder": tableState.sort.reverse ? "DESC" : "ASC",
                },
            ],
            "searchFields": [
                {
                    "fieldName": self.filterField,
                    "searchStr": self.searchString
                }
            ]
            // "rtoList": getSelectedRTOs(),
            // "vehicleStatusFlag": $scope.selectedStatus.value
        }

        if (!angular.isUndefined(tableState.search.predicateObject)) {
            payload.searchFields = [
                {
                    "fieldName": "route",
                    "searchStr": $filter('uppercase')(tableState.search.predicateObject.summaryKey)
                }
            ]
        }

        console.log('payload', payload);

        if (payload.summaryGroup == "" && payload.summaryKey == "") {
            $scope.isFiltered = false;
        } else {
            $scope.isFiltered = true;
        }

        //if ($scope.selectedStatus.value < 0)
        //    delete payload.vehicleStatusFlag;

        //console.log('payload', payload);

        ///parameter should be payload
        DashboardService.getStatisticsFilter(payload).then(
            function (response) {
                console.log('getStatisticsFilter', response.data);
                self.reportDataDisplay = response.data.data;
                // generateReportSerialNo(self.reportDataDisplay, payload.pageNo, payload.rowCount, true);
                self.isLoading = false;
                console.log('response.data', response.data);
                if (response.data.totalRecordCount == 0) {
                    self.nodataFound = true;
                    self.showDownload = false;
                } else {
                    self.nodataFound = false;
                    self.showDownload = true;
                    tableState.pagination.numberOfPages = Math.ceil(response.data.totalRecordCount / $scope.pageRecordCount);
                    console.log(tableState);
                    self.vehiclesCountAtTable = response.data.totalRecordCount;
                }

            },
            function (error) {
                self.isLoading = false;
                self.nodataFound = true;
                self.showDownload = false;
                console.log(error);
            }
        );
    }


    self.callServer = function (tableState) {

        console.log('selected filter', self.filterCaption);
        if (typeof (tableState) == 'undefined') {
            $scope.tableState.pagination.start = 0;
        }
        else {
            $scope.tableState = tableState;
        }

        getTableDetails($scope.tableState);


    };

    $scope.pageSize = {
        availableSize: getPageSizeList(),
        selectedSize: { value: '15', name: 'Page Size 15' },
    };

    $scope.onPageSizeChanged = function () {
        self.callServer();
    }

    self.showRouteDetails = function (route) {
        console.log(route);
        self.isRouteDtsShow = true;

        var payload = {
            "summaryGroup": self.summaryGroup,
            "summaryKey": self.summaryKey,
            "searchFields": [
                {
                    "fieldName": "route",
                    "searchStr": route
                }
            ]
        }

        console.log("details payload", payload);

        DashboardService.getRouteDetails(payload).then(
          function (response) {
              console.log('getRouteDetails', response.data.data);

              var arrDtls = [];
              for (var i = 0; i < response.data.data.length; i++) {

                  var jsonObj = response.data.data[i];
                  for (var key in jsonObj) {
                      arrDtls.push({
                          vehicleNo: key,
                          routeCode: jsonObj[key]
                      });
                  }
              }

              self.RouteDetailstDataDisplay = arrDtls;

              console.log('arrDtls', self.RouteDetailstDataDisplay);

          },
          function (error) {
              console.log(error);
          }
      );

    }

    self.BackToMainGrid = function () {
        self.isRouteDtsShow = false;
    };

    self.windowHeight = $window.innerHeight - 450;


    function GetAllAgencies() {
        MonitoringService.getAgencies().then(function (response) {
            //console.log(response.data.data);
            $rootScope.allAgencies = response.data.data;
        }, function (err) {
            console.log(err);
        });
    }

    $rootScope.formatDate = function (val) {
        return $filter('date')(val, "dd-MM-yyyy");
    };

    $rootScope.formatDateTime = function (val) {
        //return $filter('date')(val, "dd-MM-yyyy hh:mm a");
        return $rootScope.formatDateTimeSeconds(val);
    };

    $rootScope.formatDateTimeSeconds = function (val) {
        return $filter('date')(val, "dd-MM-yyyy hh:mm:ss a");
    };

    $rootScope.formatLatLng = function (val) {
        var formatedVal = '';
        if (angular.isDefined(val) && angular.isNumber(val)) {

            formatedVal = val.toFixed(6);
        }
        return formatedVal;
    };

    self.clearFilter = function () {

        var txtSummaryKey = angular.element(document.getElementById("txtSummaryKey"));
        txtSummaryKey.val('');
        self.filterCaption = 'List of Vehicles';
        self.summaryKey = '';
        self.summaryGroup = '';
        self.callServer();
        $scope.isFiltered = false;
    }
}