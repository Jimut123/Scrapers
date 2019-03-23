/**
 * Created by Ideation on 24-01-2017.
 */
angular.module('controlPanelApp').controller('PISController', PISController);

function PISController($scope, PISManagementService, MonitoringService, $localStorage, $filter, $state, Constants) {
    var self = this;
    self.allPISConfig = [];
    //self._allPISConfig = [];
    $scope.progress = { activated: true };
    $scope.PIS_Base_Url = Constants.API_BASE_URL;

    self.callServer = function (tableState) {

        if (typeof (tableState) == 'undefined') {
            $scope.tableState.pagination.start = 0;
        }
        else {
            $scope.tableState = tableState;
        }
        loadData($scope.tableState);
    }

    function loadData(tableState) {

        self.isLoading = false;
        self.nodataFound = true;

        $scope.pageRecordCount = $scope.pageSize.selectedSize.value;
        var pagination = tableState.pagination;
        var start = pagination.start || 0;
        var number = $scope.pageRecordCount;
        console.log('tableState', tableState);
        tableState.pagination.numberOfPages = 0;


        var _searchFields = [];
        if (tableState.search.predicateObject !== null && typeof (tableState.search.predicateObject) !== 'undefined') {
            if (angular.isDefined(tableState.search.predicateObject.displayBoardId)) {
                _searchFields.push({ "fieldName": "displayBoardId", "searchStr":  tableState.search.predicateObject.displayBoardId});
            }

            if (angular.isDefined(tableState.search.predicateObject.displayCaption)) {
                _searchFields.push({ "fieldName": "displayCaption", "searchStr": tableState.search.predicateObject.displayCaption });
            }
            
        }

        var sortField = "";
        if (typeof (tableState.sort.predicate) === 'undefined') {

            sortField = "displayBoardId";
        } else {
            sortField = tableState.sort.predicate;
        }

        var filter = {
            "pageNo": Math.floor(start / $scope.pageRecordCount),
            "rowCount": $scope.pageRecordCount,
            "sortFileds": [
                {
                    "fieldName": sortField,
                    "sortOrder": tableState.sort.reverse ? "DESC" : "ASC",
                }
            ],
            "searchFields": _searchFields
        };


        console.log('filter', filter);

        self.isLoading = true;
        self.nodataFound = false;

        PISManagementService.getPISList(filter).then(
            function (response) {
                //console.log('PIS List', response.data);
                //self.allPISConfig = response.data;
                if ($scope.progress.activated) $scope.progress.activated = false;

                    if (response.data.totalRecordCount === 0) {
                        self.nodataFound = true;
                    } else {
                        self.nodataFound = false;
                        self.allPISConfig = [];
                        tableState.pagination.numberOfPages = Math.ceil(response.data.totalRecordCount / $scope.pageRecordCount);

                        for (var i = 0; i < response.data.data.length; i++) {

                            var obj = {};

                            obj.boardId = response.data.data[i].displayBoardId;
                            obj.description = response.data.data[i].description;

                            //var config = angular.fromJson(response.data.data[i].config);
                            var config = response.data.data[i].config;
                            //config = angular.fromJson(config.config);
                            //config = angular.fromJson(config.config);

                            obj.selectedStopId = config.selectedStopId;
                            //var stopFound = $filter('filter')($localStorage.allStops, { stopId: config.selectedStopId }, isEqual);
                            //if (stopFound != null && stopFound.length > 0) {
                            //    obj.stoppage = stopFound[0].stopName;
                            //} else {
                            //    obj.stoppage = '';
                            //}
                            obj.stoppage = response.data.data[i].stopName;
                            obj.caption = response.data.data[i].displayCaption;
                            obj.selectedRadius = config.selectedRadius;
                            obj.sortByTime = config.sortByTime;
                            obj.pageSize = config.pageSize;

                            self.allPISConfig.push(obj);
                        }
                    }

                   

                    //self._allPISConfig = self.allPISConfig;
            },
            function (err) {
                console.log(err);
            }
        );

        //ReportService.getVehiclePingTime(filter).then(
        //    function (response) {
        //        console.log(response.data.data);
        //        self.reportDataDisplay = response.data.data;
        //        generateReportSerialNo(self.reportDataDisplay, filter.pageNo, filter.rowCount, true);
        //        self._reportDataDisplay = response.data.data;
        //        self.isLoading = false;
        //        if (response.data.totalRecordCount === 0) {
        //            self.nodataFound = true;
        //            self.showDownload = false;
        //            self.reportDataDisplay = [];
        //            self._reportDataDisplay = [];
        //        } else {
        //            self.nodataFound = false;
        //            self.showDownload = true;
        //            tableState.pagination.numberOfPages = Math.ceil(response.data.totalRecordCount / $scope.pageRecordCount);

        //            console.log(tableState);
        //        }
        //    },
        //    function (error) {
        //        self.isLoading = false;
        //        self.nodataFound = true;
        //        console.log(error);
        //    }
        //);
    };

    

    if ($localStorage.allRoutes == null && typeof ($localStorage.allRoutes) == 'undefined') {

        //MonitoringService.getAllStops().then(function (response) {
        //    $localStorage.allStops = response.data.data;
        //}, function (err) {
        //    console.log(err);
        //});

        MonitoringService.getAllRoutes().then(function (response) {
            console.log('getAllRoutes', response.data.data);
            //$localStorage.allRoutes = response.data.data;
            $localStorage.allRoutes = $filter('orderBy')(response.data.data, 'routeShortName');
            for (var i = 0; i < $localStorage.allRoutes.length; i++) {
                var obj = $localStorage.allRoutes[i];
                obj.ticked = false;
            }

        }, function (err) {
            console.log(err);
        });

    }



    function isEqual(actual, expected) { return angular.equals(actual, expected) };

    /*set values to differentiate between add user and edit user operations*/
    self.setClickSource = function (type, index, event) {
        //self.modalTitle = type + ' User';
        if (type === 'Edit') {
            $localStorage.selectedDBN = self.allPISConfig[index].boardId;
        } else if (type === 'Add') {
            $localStorage.selectedDBN = null;
        }


        console.log('selected config', self.selectedPisConfig);
        openConfig(event);
    };

    function openConfig(ev) {
        console.log('within configuration');
        //$mdDialog.show({
        //    controller: PISConfigController,
        //    templateUrl: '../views/nestedViews/pisconfiguration.html',
        //    parent: angular.element(document.body),
        //    targetEvent: ev,
        //    clickOutsideToClose: true,
        //    fullscreen: true
        //})
        //.then(function (answer) {
        //    //$scope.status = 'You said the information was "' + answer + '".';
        //}, function () {
        //    //$scope.status = 'You cancelled the dialog.';
        //});

        $state.go('home.single_pis');
    };


    self.DeletePis = function (id) {

        swal({
            title: "Are you sure?",
            text: "Data will be deleted.. ",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF5350",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel pls!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if (isConfirm) {
               
                PISManagementService.deletePIS(id).then(
                    function (response) {
                        console.log('after delete', response.data);
                        self.allPISConfig;

                        var removeIndex = self.allPISConfig.map(function(item) { return item.boardId; }).indexOf(response.data.boardId);
                        // remove object
                        self.allPISConfig.splice(removeIndex, 1);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }

        });

    }

    $scope.pageSize = {
        availableSize: getPageSizeList(),
        selectedSize: { value: '15', name: 'Page Size 15' },
    };

    $scope.onPageSizeChanged = function () {
        self.callServer();
    }

}


