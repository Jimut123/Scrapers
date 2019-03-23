/**
 * Created by Ideation on 24-01-2017.
 */
angular.module('controlPanelApp').controller('LatestPingReportController', LatestPingReportController);

function LatestPingReportController(ReportService, $scope, $state, $localStorage, $filter, MonitoringService, $timeout, $rootScope, Constants, MiscServices, $uibModal) {

    var navbarHeight = angular.element(".navbar")[0].offsetHeight;
    var pageHeaderHeight = angular.element(".page-header")[0].offsetHeight;
    $scope.iframeHeight = window.innerHeight - navbarHeight - pageHeaderHeight - (window.innerHeight / 10);

    var self = this;
    var curDate = new Date();

    self.showDownload = false;
    self._reportDataDisplay = [];
    self.reportDataDisplay = [];
    self.selectedRegnNos = null;
    self.selectedVTUs = null;
    self.selectedAgencies = null;
    self.nodataFound = true;
    self.allRegnNos = [];
    self.allRoutes = [];
   

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

    $scope.loadVehiclesAsync = function (search) {
        $scope.refresingVehicle = true;
        console.log('search', search);
        //var filteredList = $filter('filter')($localStorage.vehicleNos, { vehicleRegNo: search });
        MonitoringService.getMatchingVehicleNos('*', search).then(function (response) {
            self.allRegnNos = response.data.data;
            $scope.refresingVehicle = false;

        }, function (err) {
            console.log(err);
        });

    }

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


        var searchString = "";
        if (tableState.search.predicateObject !== null && typeof (tableState.search.predicateObject) !== 'undefined') {
            searchString = tableState.search.predicateObject.deviceImei;
        }

        var sortField = "";
        if (typeof (tableState.sort.predicate) === 'undefined') {

            sortField = "lastRoute";
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
                },
            ],
            "agencyNames": MiscServices.getSelectedValues(self.selectedAgencies, "agencyName"),
            "dataSources": MiscServices.getSelectedValues(self.selectedVTUs, "dataSource"),
            "routeCodes": MiscServices.getSelectedValues(self.selectedRoutes, "routeShortName"),
            "vehicleNos": MiscServices.getSelectedValues(self.selectedRegnNos, "vehicleRegNo")
        };


        console.log('filter', filter);

        self.isLoading = true;
        self.nodataFound = false;

        ReportService.getVehiclePingTime(filter).then(
            function (response) {
                console.log(response.data.data);
                self.reportDataDisplay = response.data.data;
                generateReportSerialNo(self.reportDataDisplay, filter.pageNo, filter.rowCount, true);
                self._reportDataDisplay = response.data.data;
                self.isLoading = false;
                if (response.data.totalRecordCount === 0) {
                    self.nodataFound = true;
                    self.showDownload = false;
                    self.reportDataDisplay = [];
                    self._reportDataDisplay = [];
                } else {
                    self.nodataFound = false;
                    self.showDownload = true;
                    tableState.pagination.numberOfPages = Math.ceil(response.data.totalRecordCount / $scope.pageRecordCount);

                    console.log(tableState);
                }
            },
            function (error) {
                self.isLoading = false;
                self.nodataFound = true;
                console.log(error);
            }
        );
    };

    //self.formatDateTime = function (val) {
    //    var _formatedDatetime = longToDate(val);
    //    return _formatedDatetime;
    //};

    self.reportFileName = function (fileType) {
        return MiscServices.generateReportFileName('LatestPingTime', fileType);
    }

    //server side download
    self.downloadFile = function (reportType) {
        self.rptFileType = reportType;
        var pagination = $scope.tableState.pagination;
        var start = pagination.start || 0;
        var number = $scope.pageRecordCount;

        
        var searchString = "";
        if ($scope.tableState.search.predicateObject !== null && typeof ($scope.tableState.search.predicateObject) !== 'undefined') {
            searchString = $scope.tableState.search.predicateObject.deviceImei;
        }

        var sortField = "";
        if (typeof ($scope.tableState.sort.predicate) === 'undefined') {

            sortField = "lastRoute";
        } else {
            sortField = $scope.tableState.sort.predicate;
        }

        var filter = {
            "pageNo": Math.floor(start / $scope.pageRecordCount),
            "rowCount": $scope.pageRecordCount,
            "sortFileds": [
                {
                    "fieldName": sortField,
                    "sortOrder": $scope.tableState.sort.reverse ? "DESC" : "ASC",
                },
            ],
            "agencyNames": MiscServices.getSelectedValues(self.selectedAgencies, "agencyName"),
            "dataSources": MiscServices.getSelectedValues(self.selectedVTUs, "dataSource"),
            "routeCodes": MiscServices.getSelectedValues(self.selectedRoutes, "routeShortName"),
            "vehicleNos": MiscServices.getSelectedValues(self.selectedRegnNos, "vehicleRegNo"),
            "reportType": reportType
        };


     
        console.log('payload for download', filter);

        var urlSuffix = 'restapi/report/vehicle/getVehiclePingTime/download.json';
        self.isDownloading = true;
        ReportService.downloadReportData(filter, urlSuffix).then(
            function (response) {
                var file;
                if (reportType == Constants.ReportFileType.PDF)
                    file = new Blob([response.data], { type: 'application/pdf' });
                else if (reportType == Constants.ReportFileType.EXCEL)
                    file = new Blob([response.data], { type: 'application/vnd.ms-excel' });
                saveAs(file, self.reportFileName(reportType));
                self.isDownloading = false;
            },
            function (error) {
                self.isDownloading = false;
                console.log(error);
            }
        );
    }


    $scope.pageSize = {
        availableSize: getPageSizeList(),
        selectedSize: { value: '10', name: 'Page Size 10' },
    };

    $scope.onPageSizeChanged = function () {
        self.callServer();
    }


    $scope.showMap = function (index, event) {

        var _item = angular.copy(self.reportDataDisplay[index]);

        //if (_item.geoLocation !== null) {
        //    var item = _item;

        //    item.lastLocation = { latitude: 0, longitude: 0 };
        //    item.lastLocation.latitude = _item.geoLocation.latitude;
        //    item.lastLocation.longitude = _item.geoLocation.longitude;

        //}

        $uibModal.open({
            templateUrl: 'vehicleLocModal.html',
            controller: 'VehicleLocModalController',
            controllerAs: 'VLMCtrl',
            resolve: {
                parent: function () {
                    return self;
                },

                locObj: function () {
                    return _item;
                },

                tracking: function () {
                    return false;
                }
            }
        }).result.finally(angular.noop).then(angular.noop, angular.noop);

    }

}
