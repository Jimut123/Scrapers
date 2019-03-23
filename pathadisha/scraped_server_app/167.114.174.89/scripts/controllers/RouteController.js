/**
 * Created by Ideation on 04-Apr-17.
 */

angular.module('controlPanelApp').controller('RouteController', RouteController);

function RouteController(RouteManagementService, DepotManagementService, StopManagementService, AssociationManagementService, MiscServices) {
    var self = this;
    self.displayDepotList = [];
    self.routeSelected = false;
    self.stopListForSelectedRoute = [];

    RouteManagementService.get().$promise.then(
        function (routeListResponse) {
            self.routeList = routeListResponse.data;
        },
        function (error) {
            console.log(error);
        }
    );

    DepotManagementService.get().$promise.then(
        function (depotListResponse) {
            self.depotList = depotListResponse.data;
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

    self.callBack = function (selected) {
        if(selected === undefined){
            self.routeSelected = false;
        }else{
            self.routeSelected = true;
        }
        self.displayDepotList = [];
        self.stopListForSelectedRoute = [];
        self.depotFetched = false;
        self.stopFetched = false;
        self.selectedRoute = selected.originalObject;

        AssociationManagementService.getDeoptsByRoute(new self.routePayload(selected.originalObject)).then(
            function (response) {
                self.depotListForSelectedRoute = response.data.data;
                self.displayDepotList = MiscServices.selectize(self.depotList, 'depotId', self.depotListForSelectedRoute, 'depotId');
                self.depotFetched = true;
            },
            function (error) {
                console.log(error);
            });
        AssociationManagementService.getStopsByRoute(new self.routePayload(selected.originalObject)).then(
            function (response) {
                if(response.data.status !== 'FAILURE'){
                    self.stopListForSelectedRoute = response.data.data;
                }
                self.stopFetched = true;
            },
            function (error) {
                console.log(error);
            });

    }

    self.saveRouteDepotAssoc = function () {
        AssociationManagementService.linkRouteToDepots(new self.RouteDepotRequestObj(self.selectedRoute, self.displayDepotList)).then(
            function (response) {
                if(response.data.status == 'SUCCESS'){
                    alert('Route-Depot Association was successful.');
                }else{
                    alert('Route-Depot Association failed!');
                }
            },
            function (error) {
                alert('Route-Depot Association failed!');
                console.log(error);
            }
        );
    }

    self.saveRouteStopAssoc = function () {
        var reqObj = new self.RouteStopRequestObject(self.selectedRoute ,self.stopListForSelectedRoute);
        AssociationManagementService.linkStopsToRoute(reqObj).then(
            function (response) {
                if(response.data.status == 'SUCCESS'){
                    alert('Route-Stop Association was successful.');
                }else{
                    alert('Route-Stop Association failed!');
                }
            },
            function (error) {
                alert('Route-Stop Association failed!');
                console.log(error);
            }
        );
    }

    self.routePayload = function (route) {
        this.routeCode = route.routeShortName;
    }

    self.RouteDepotRequestObj = function (route, depotList) {
        this.routeId = route.routeId;
        this.routeDepots = [];
        for (var i = 0; i < depotList.length; i++) {
            if(depotList[i]._selected){
                var tempObj = {depot:{depotId:depotList[i].depotId}};
                this.routeDepots.push(tempObj)
            }
        }
    }

    self.addStopToList = function () {
        self.stopListForSelectedRoute.push(self.selectedStop.originalObject)
    }

    self.removeStop = function (index) {
        self.stopListForSelectedRoute.splice(index,1);
    }

    self.RouteStopRequestObject = function (route, stopList) {
        this.routeId = route.routeId;
        this.routeStops = [];
        for (var i = 0; i < stopList.length; i++) {
            var tempObj = {
                stop:{stopId:stopList[i].stopId},
                stopSequence: i
            };
            this.routeStops.push(tempObj);
        }
    }
}