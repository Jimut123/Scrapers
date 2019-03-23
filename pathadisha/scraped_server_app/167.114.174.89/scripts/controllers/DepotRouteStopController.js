/**
 * Created by Ideation on 04-Apr-17.
 */

angular.module('controlPanelApp').controller('DepotRouteStopController', DepotRouteStopController);

function DepotRouteStopController(DepotManagementService, RouteManagementService, StopManagementService, AssociationManagementService, $uibModal) {
    var self = this;

    self.depotListDisplay = [];
    self.routeListDisplay = [];
    self.stopListDisplay = [];

    DepotManagementService.get().$promise.then(
        function (depotListResponse) {
            self.depotList = depotListResponse.data;
        },
        function (error) {
            console.log(error);
        }
    );

    RouteManagementService.get().$promise.then(
        function (routeListResponse) {
            self.routeList = routeListResponse.data;
        },
        function (error) {
            console.log(error);
        }
    );

    StopManagementService.get().$promise.then(
        function (stopListResponse) {
            self.stopList = stopListResponse.data;
        },
        function (error) {
            console.log(error);
        }
    );

    self.addEditDepot = function (mode, index) {
        self.modalTitle = mode + ' Depot';

        if (mode === 'Add') {
            self.selectedDepot = {"depotName": null};
            self.depotOperationIsAdd = true;
        } else if (mode === 'Edit') {
            self.selectedDepot = self.depotListDisplay[index];
            self.depotOperationIsAdd = false;
        }

        $uibModal.open({
            templateUrl: 'addEditDepotModal.html',
            controller: 'AddEditDepotModalController',
            controllerAs: 'AEDMCtrl',
            resolve: {
                parent: function () {
                    return self;
                }
            }
        });
    };
    self.addEditRoute = function (mode, index) {
        self.modalTitle = mode + ' Route';

        if (mode === 'Add') {
            self.selectedRoute = {"routeShortName": null, "routeLongName": null};
            self.routeOperationIsAdd = true;
        } else if (mode === 'Edit') {
            self.selectedRoute = self.routeListDisplay[index];
            self.routeOperationIsAdd = false;
        }

        $uibModal.open({
            templateUrl: 'addEditRouteModal.html',
            controller: 'AddEditRouteModalController',
            controllerAs: 'AERMCtrl',
            resolve: {
                parent: function () {
                    return self;
                }
            }
        });
    };
    self.addEditStop = function (mode, index) {
        self.modalTitle = mode + ' Stop';

        if (mode === 'Add') {
            self.selectedStop = {"stopName": null, "stopLat": null, "stopLon": null};
            self.stopOperationIsAdd = true;
        } else if (mode === 'Edit') {
            self.selectedStop = self.stopListDisplay[index];
            self.stopOperationIsAdd = false;
        }

        $uibModal.open({
            templateUrl: 'addEditStopModal.html',
            controller: 'AddEditStopModalController',
            controllerAs: 'AESMCtrl',
            resolve: {
                parent: function () {
                    return self;
                }
            }
        });
    };

    self.saveDepot = function () {
        DepotManagementService.save(self.selectedDepot).$promise.then(
            function (depotResponse) {
                if (self.depotOperationIsAdd) {
                    self.depotList.push(depotResponse.data[0]);
                }
                console.log('depot added');
                console.log(depotResponse);
            }, function (error) {
                console.log(error);
            });
    };

    self.saveRoute = function () {
        RouteManagementService.save(self.selectedRoute).$promise.then(
            function (routeResponse) {
                if (self.routeOperationIsAdd) {
                    self.routeList.push(routeResponse.data[0]);
                }
                console.log('route added');
                console.log(routeResponse);
            }, function (error) {
                console.log(error);
            });
    };

    self.saveStop = function () {
        StopManagementService.save(self.selectedStop).$promise.then(
            function (stopResponse) {
                if (self.stopOperationIsAdd) {
                    self.stopList.push(stopResponse.data[0]);
                }
                console.log('stop added');
                console.log(stopResponse);
            }, function (error) {
                console.log(error);
            });
    };


};

angular.module('controlPanelApp').controller('AddEditDepotModalController', function (parent, $uibModalInstance) {
    this.parent = parent;

    this.cancel = function () {

        $uibModalInstance.dismiss('cancel');
    };
    this.save = function () {
        parent.saveDepot();
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('controlPanelApp').controller('AddEditRouteModalController', function (parent, $uibModalInstance) {
    this.parent = parent;

    this.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    this.save = function () {
        parent.saveRoute();
        $uibModalInstance.dismiss('cancel');
    };
});

angular.module('controlPanelApp').controller('AddEditStopModalController', function (parent, $uibModalInstance) {
    this.parent = parent;

    this.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    this.save = function () {
        parent.saveStop();
        $uibModalInstance.dismiss('cancel');
    };
});
