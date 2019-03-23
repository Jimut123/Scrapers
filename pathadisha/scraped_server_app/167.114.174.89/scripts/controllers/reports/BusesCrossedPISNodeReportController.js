/**
 * Created by Ideation on 24-01-2017.
 */
angular.module('controlPanelApp').controller('BusesCrossedPISNodeReportController', BusesCrossedPISNodeReportController);

function BusesCrossedPISNodeReportController(ReportService, $scope, $state, $localStorage, $filter, PISManagementService, $timeout, $rootScope, Constants, MiscServices) {

    var navbarHeight = angular.element(".navbar")[0].offsetHeight;
    var pageHeaderHeight = angular.element(".page-header")[0].offsetHeight;
    $scope.iframeHeight = window.innerHeight - navbarHeight - pageHeaderHeight - (window.innerHeight / 10);

    var self = this;
    var curDate = new Date();

    self.showDownload = false;
    self._reportDataDisplay = [];
    self.reportDataDisplay = [];
    self.startDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0);
    self.endDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 23, 59, 0);
    self.minimumDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0);
    self.maximumDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 23, 59, 0);
    self.selectedStop = null;
    self.selectedVTUs = null;
    self.selectedAgencies = null;
    self.nodataFound = true;
    self.selectedDBN = "";
    self.pisNode = { dbn: "", stopId: "", routes: [] };

    $scope.loadNodesAsync = function (search) {
        $scope.refresingNode = true;
        console.log('search', search);

        var _searchFields = [];
        _searchFields.push({ "fieldName": "displayBoardId", "searchStr": search });

        var filter = {
            "pageNo": 0,
            "rowCount": 10,
            "sortFileds": [
                {
                    "fieldName": "displayBoardId",
                    "sortOrder": "ASC"
                }
            ],
            "searchFields": _searchFields
        };

        PISManagementService.getPISList(filter).then(
            function (response) {

                self.allNodes = response.data.data;
                $scope.refresingNode = false;
            },
            function (err) {
                console.log(err);
            }
        );

    }

    self.callServer = function (tableState) {

        if (typeof (tableState) == 'undefined') {
            $scope.tableState.pagination.start = 0;
        }
        else {
            $scope.tableState = tableState;
        }

        if (self.selectedDBN == "") {
            tableState.pagination.numberOfPages = 0;
            return;
        }

        self.isLoading = true;
        self.nodataFound = false;

        if (self.selectedDBN != self.pisNode.dbn) {
            console.log('selectedDBN', self.selectedDBN);
            PISManagementService.getPisConfigDetail(self.selectedDBN.displayBoardId).then(
            function (response) {
                if (response.data != null) {

                    self.pisNode.dbn = response.data.boardId;
                    var config = angular.fromJson(response.data.config);

                    self.pisNode.stopId = config.selectedStopId;
                    var routes = angular.fromJson(config.selectedRoutes);

                    self.pisNode.routes = [];

                    for (var i = 0; i < routes.length; i++) {
                        self.pisNode.routes.push(routes[i].routeShortName);
                    }

                    loadData($scope.tableState);

                }
            },
          function (err) {
              console.log(err);
          });
        } else {
            loadData($scope.tableState);
        }
       
    }

    function loadData(tableState) {

        //self.isLoading = false;
        //self.nodataFound = true;

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

            sortField = "agencyName";
        } else {
            sortField = tableState.sort.predicate;
        }

        //var totalsec = (ArmisDateParse(self.endDate, Constants.MP_DATE_FORMAT).getTime() - ArmisDateParse(self.startDate, Constants.MP_DATE_FORMAT).getTime()) / 1000;

        var filter = {
            "pageNo": Math.floor(start / $scope.pageRecordCount),
            "rowCount": $scope.pageRecordCount,
            "startDate": ArmisDateParse(self.startDate, Constants.MP_DATE_FORMAT).getTime(),
            "endDate": ArmisDateParse(self.endDate, Constants.MP_DATE_FORMAT).getTime(),
            "sortFileds": [
                {
                    "fieldName": sortField,
                    "sortOrder": tableState.sort.reverse ? "DESC" : "ASC",
                },
            ],
            "agencyNames": MiscServices.getSelectedValues(self.selectedAgencies, "agencyName"),
            "dataSources": MiscServices.getSelectedValues(self.selectedVTUs, "dataSource"),
            "stopId": self.pisNode.stopId,
            "routeCodes": self.pisNode.routes,
            "pisCaption": self.selectedDBN.displayCaption + " (" + self.selectedDBN.displayBoardId + ")"
        };

        //if (totalsec == 86340) {
        //    delete filter.startDate;
        //    delete filter.endDate;
        //}

        console.log('filter', filter);

        //self.isLoading = true;
        //self.nodataFound = false;

        ReportService.getVehiclesAtStop(filter).then(
            function (response) {
                console.log(response.data.data);
                self.reportDataDisplay = response.data.data;
                generateReportSerialNo(self.reportDataDisplay, filter.pageNo, filter.rowCount, true);
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

   
    self.reportFileName = function (fileType) {
        return MiscServices.generateReportFileName('BusesCrossedGivenPIS', fileType);
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

            sortField = "agencyName";
        } else {
            sortField = $scope.tableState.sort.predicate;
        }

        var filter = {
            "pageNo": Math.floor(start / $scope.pageRecordCount),
            "rowCount": $scope.pageRecordCount,
            "startDate": ArmisDateParse(self.startDate, Constants.MP_DATE_FORMAT).getTime(),
            "endDate": ArmisDateParse(self.endDate, Constants.MP_DATE_FORMAT).getTime(),
            "sortFileds": [
                {
                    "fieldName": sortField,
                    "sortOrder": $scope.tableState.sort.reverse ? "DESC" : "ASC",
                },
            ],
            "agencyNames": MiscServices.getSelectedValues(self.selectedAgencies, "agencyName"),
            "dataSources": MiscServices.getSelectedValues(self.selectedVTUs, "dataSource"),
            "stopId": self.pisNode.stopId,
            "routeCodes": self.pisNode.routes,
            "pisCaption": self.selectedDBN.displayCaption + " (" + self.selectedDBN.displayBoardId + ")",
            "reportType": reportType
        };

     
        console.log('payload for download', filter);

        var urlSuffix = 'restapi/report/vehicle/getVehiclesAtStop/download.json';
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
