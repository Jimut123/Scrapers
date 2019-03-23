/**
 * Created by Aditya on 06-Apr-17.
 */

angular.module('controlPanelApp')
    .factory('DepotManagementService', ['$resource', function ($resource) {
        return $resource('/restapi/depot');
    }])
    .factory('RouteManagementService', ['$resource', function ($resource) {
        return $resource('/restapi/route');
    }])
    .factory('StopManagementService', ['$resource', function ($resource) {
        return $resource('/restapi/stop');
    }])
    .factory('AssociationManagementService', ['$http', function ($http) {
        return {
            linkRouteToDepots: function (route) {
                var req = {
                    method: 'POST',
                    url: 'restapi/route/linkRouteToDepots',
                    data: route,
                }
                return $http(req);
            },
            linkStopsToRoute: function (route) {
                var req = {
                    method: 'POST',
                    url: 'restapi/route/linkStopsToRoute',
                    data: route,
                }
                return $http(req);
            },
            getDeoptsByRoute: function (route) {
                var req = {
                    method: 'POST',
                    url: 'restapi/depot/byRouteCode',
                    data: route,
                }
                return $http(req);
            },
            getStopsByRoute: function (route) {
                var req = {
                    method: 'POST',
                    url: 'restapi/stop/byRouteCode',
                    data: route,
                }
                return $http(req);
            }
        }
    }]).factory('PISManagementService', ['$http', 'Constants', function ($http, Constants) {
    return {
        getAllPISList: function () {
            var req = {
                method: 'GET',
                url: 'restapi/pis/list'
            }
            return $http(req);
        },
        getPISList: function (filter) {
            var req = {
                method: 'POST',
                url: 'restapi/pis/list',
                data: filter
            }
            return $http(req);
        },
        getPisConfigDetail: function (dbn) {
            var req = {
                method: 'GET',
                url: 'restapi/pis/config/' + dbn + '.json'
            }
            return $http(req);
        },
        getStopRoutes: function (payload) {
            var req = {
                method: 'POST',
                url: Constants.API_BASE_URL + 'app/routes/getRouteByStop.json',
                data: payload
            }
            return $http(req);
        },
        updatePISDetails: function (payload) {
            var _url = 'restapi/pis/config';
            var req = {
                method: 'POST',
                url: _url,
                data: payload
            }
            return $http(req);
        },

        deletePIS: function (dbn) {
            var _url = '';
            _url = 'restapi/pis/delete/' + dbn;
            var req = {
                method: 'POST',
                url: _url
                //data: '{dbn=11245}'
            }
            return $http(req);
        }
    }
    }]);
