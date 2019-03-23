/**
 * Created by Ideation on 24-01-2017.
 */
angular.module('controlPanelApp').controller('RouteAllocationReportController', RouteAllocationReportController);

function RouteAllocationReportController(ReportService, $scope, $state, $localStorage, $filter, MonitoringService, $timeout, $rootScope, Constants, MiscServices) {

    var navbarHeight = angular.element(".navbar")[0].offsetHeight;
    var pageHeaderHeight = angular.element(".page-header")[0].offsetHeight;
    $scope.iframeHeight = window.innerHeight - navbarHeight - pageHeaderHeight - (window.innerHeight / 10);

    var self = this;
    var curDate = new Date();

    self.showDownload = false;
    self._reportDataDisplay = [];
    self.reportDataDisplay = [];
    self.allocationDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0);
    self.maximumDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 23, 59, 0);
    self.selectedStop = null;
    self.selectedVTUs = null;
    self.selectedAgencies = null;
    self.nodataFound = true;
   

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

    $scope.allAllocTypes = [{ "AllocType": "Allocated", "AllocTypeValue": "A" }, { "AllocType": "Un-allocated", "AllocTypeValue": "U" }];

    self.selectedAllocType = { "AllocType": "Allocated", "AllocTypeValue": "A" };

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

            sortField = "modifiedOn";
        } else {
            sortField = tableState.sort.predicate;
        }


        var selDate = ArmisDateParse(self.allocationDate, Constants.MP_DATE_ONLY_FORMAT);

        self.startDate = new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate(), 0, 0, 0);
        self.endDate = new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate(), 23, 59, 0);

        console.log('self.startDate', self.startDate);
        console.log('self.endDate', self.endDate);

        var filter = {
            "pageNo": Math.floor(start / $scope.pageRecordCount),
            "rowCount": $scope.pageRecordCount,
            "startDate": self.startDate.getTime(),
            "endDate": self.endDate.getTime(),
            "sortFileds": [
                {
                    "fieldName": sortField,
                    "sortOrder": tableState.sort.reverse ? "DESC" : "ASC",
                },
            ],
            "agencyNames": MiscServices.getSelectedValues(self.selectedAgencies, "agencyName"),
            "dataSources": MiscServices.getSelectedValues(self.selectedVTUs, "dataSource"),
            "vehicleNos": MiscServices.getSelectedValues(self.selectedRegnNos, "vehicleRegNo"),
            "allocation": MiscServices.getSelectedValues(self.selectedAllocType, "AllocTypeValue")[0]
            
        };

        console.log('filter', filter);

        self.isLoading = true;
        self.nodataFound = false;

        ReportService.getRouteAllocation(filter).then(
            function (response) {
                console.log(response.data.data);
                self.reportDataDisplay = response.data.data;
                generateReportSerialNo(self.reportDataDisplay, filter.pageNo, filter.rowCount, true);
                //self._reportDataDisplay = response.data.data;
                self.isLoading = false;
                if (response.data.totalRecordCount === 0) {
                    self.nodataFound = true;
                    self.showDownload = false;
                    self.reportDataDisplay = [];
                    //self._reportDataDisplay = [];
                } else {
                    self.nodataFound = false;
                    self.showDownload = true;
                    tableState.pagination.numberOfPages = Math.ceil(response.data.totalRecordCount / $scope.pageRecordCount);

                    for (var i = 0; i < self.reportDataDisplay.length; i++) {
                        var arr = self.reportDataDisplay[i].routeCodes;
                        for (var j = 0; j < arr.length; j++) {
                            if (j == 0) {
                                self.reportDataDisplay[i].routeCodesDisplay = arr[j];
                            } else {
                                self.reportDataDisplay[i].routeCodesDisplay = self.reportDataDisplay[i].routeCodesDisplay + ", " + arr[j];
                            }
                        }
                    }
                    //routeCodesDisplay
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

    self.reportFileName = function (fileType) {
        return MiscServices.generateReportFileName('RouteAllocation', fileType);
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

            sortField = "modifiedOn";
        } else {
            sortField = $scope.tableState.sort.predicate;
        }

        console.log($scope.startdate);
        console.log($scope.starttime);

        var filter = {
            "pageNo": Math.floor(start / $scope.pageRecordCount),
            "rowCount": $scope.pageRecordCount,
            "startDate": self.startDate.getTime(),
            "endDate": self.endDate.getTime(),
            "sortFileds": [
                {
                    "fieldName": sortField,
                    "sortOrder": $scope.tableState.sort.reverse ? "DESC" : "ASC",
                },
            ],
            "agencyNames": MiscServices.getSelectedValues(self.selectedAgencies, "agencyName"),
            "dataSources": MiscServices.getSelectedValues(self.selectedVTUs, "dataSource"),
            "vehicleNos": MiscServices.getSelectedValues(self.selectedRegnNos, "vehicleRegNo"),
            "allocation": MiscServices.getSelectedValues(self.selectedAllocType, "AllocTypeValue")[0],
            "reportType": reportType
        };

     
        console.log('payload for download', filter);

        var urlSuffix = 'restapi/report/manage/getRouteAllocation/download.json';
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

}
