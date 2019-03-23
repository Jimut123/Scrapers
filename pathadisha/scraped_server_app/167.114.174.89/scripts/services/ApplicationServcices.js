/**
 * Created by Aditya on 03-02-2017.
 */
angular.module('controlPanelApp')
    .factory('MembershipUserService', ['$resource', function ($resource) {
        return $resource('/restapi/account/users/:id', null, {
            'update': {method: 'PUT'}
        });
    }])
    .factory('MembershipUserRoleService', ['$resource', function ($resource) {
        return $resource('/restapi/account/userRoles');
    }])
    .factory('MembershipService', ['$http', function ($http) {
        return {
            getAllUsers: function () {
                var req = {
                    method: 'GET',
                    url: 'restapi/account/users'
                }
                return $http(req);
            },
            getAllRoles: function () {
                var req = {
                    method: 'GET',
                    url: 'restapi/account/userRoles'
                }
                return $http(req);
            }
        };
    }])
    .factory('MonitoringService', ['$http', 'Constants', function ($http, Constants) {
        var factory = {};

        factory.getVehicleListByRecBoundary = function (recBoundary) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicleStatus/byArea',
                data: recBoundary,
            }
            return $http(req);
        }

        factory.getVehicleListByRegNo = function (vehicleNo) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicleStatus/byRegNo',
                data: vehicleNo,
            }
            return $http(req);
        }

        factory.getVehicleListByRouteCode = function (routeCode) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicleStatus/byRouteCode',
                data: routeCode,
            }
            return $http(req);
        }

        factory.getVehicleListByDepot = function (depot) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicleStatus/byDepot',
                data: depot,
            }
            return $http(req);
        }

        factory.getPointByRoute = function (routeCode) {
            var req = {
                method: 'POST',
                url: baseUrl + 'app/paths/getPathByRoute.json',
                data: routeCode,
            }
            return $http(req);
        }

        factory.getPathByRoute = function (routeCode) {
            var req = {
                method: 'POST',
                url: 'restapi/path/byRouteCode',
                data: routeCode,
            }
            return $http(req);
        }

        factory.getDepots = function () {
            var req = {
                method: 'GET',
                url: 'restapi/depot'
            }
            return $http(req);
        }

        factory.getAgencies = function () {
            var req = {
                method: 'GET',
                url: 'restapi/agency'
            }
            return $http(req);
        }

        factory.getRoutes = function (depot) {
            var req = {
                method: 'GET',
                url: 'restapi/route' + '?depot=' + depot
            }
            return $http(req);
        }

        factory.getAllRoutes = function () {
            var req = {
                method: 'GET',
                //url: 'restapi/route'
                url: Constants.API_BASE_URL + 'app/routes/getAllRoutes.json'
            }
            return $http(req);
        }
        factory.getMatchingRoutes = function (searchText) {
            var req = {
                method: 'GET',
                url: Constants.API_BASE_URL + 'app/routes/getMatchingRoutes/' + searchText +'.json'
            }
            return $http(req);
        }

        factory.getAllStops = function () {
            var req = {
                method: 'GET',
                //url: 'restapi/stop'
                url: Constants.API_BASE_URL + 'app/stops/getAllStops.json'
            }
            return $http(req);
        }

        factory.getMatchingStops = function (searchText) {
            var req = {
                method: 'GET',
                //url: 'restapi/stop'
                url: Constants.API_BASE_URL + 'app/stops/getMatchingStops/' + searchText + '.json'
            }
            return $http(req);
        }

        factory.getStopById = function (Id) {
            var req = {
                method: 'GET',
                url: Constants.API_BASE_URL + 'app/stops/' + Id + '.json'
            }
            return $http(req);
        }

        //factory.getMatchingStops = function (stopNamePart) {
        //    var req = {
        //        method: 'GET',
        //        url: 'restapi/stop/search/' + stopNamePart
        //    }
        //    return $http(req);
        //}

        factory.geVehicleNos = function (vehicleType) {
            var req = {
                method: 'GET',
                url: 'restapi/vehicle?vt=' + vehicleType
            }
            return $http(req);
        }

        factory.getMatchingVehicleNos = function (vehicleType, numberPart) {
            var req = {
                method: 'GET',
                url: Constants.API_BASE_URL + 'app/vehicles/getMatchingVehicles/' + vehicleType + '/' + numberPart
            }
            return $http(req);
        }


        factory.getVehicleListBydataSource = function (dsource) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicleStatus/byDataSource',
                data: dsource,
            }
            return $http(req);
        }

        factory.getVehicleStatusByRegNo = function (vehicleNo) {
            var req = {
                method: 'POST',
                url: 'restapi/public/vehicleStatusByRegNo',
                data: vehicleNo,
            }
            return $http(req);
        }

        factory.getVehicleETA = function (vehicleNo) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicle/eta',
                data: vehicleNo,
            }
            return $http(req);
        }

        factory.getAmbulancePosition = function (payload) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicleStatus/byArea',
                data: payload,
            }
            return $http(req);
        }

        factory.getPolcarPosition = function (payload) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicleStatus/byFilter',
                data: payload,
            }
            return $http(req);
        }

        factory.getAccountInfo = function (accountName) {
            var req = {
                method: 'POST',
                url: 'restapi/account/getAccountDetails',
                data: accountName,
            }
            return $http(req);
        }

        factory.getVehicleStatusByFilter = function (filter) {
            var req = {
                method: 'POST',
                url: 'restapi/vehicleStatus/byFilter',
                data: filter,
            }
            return $http(req);
        }

        factory.getNodalAgencies = function (agencyType) {
            var req = {
                method: 'GET',
                url: 'restapi/nodalagency'
            }
            return $http(req);
        }

        return factory;
    }])
    .factory('ReportService', ['$http', function ($http) {
        return {
            getTripCountReport: function (timeSlab, timeZone) {
                var req = {
                    method: 'GET',
                    url: 'restapi/report/tripCount?timeSlab=' + timeSlab + '&timeZone=' + timeZone
                }
                return $http(req);
            },

            getTripTimeReport: function (timeZone) {
                var req = {
                    method: 'GET',
                    url: 'restapi/report/tripTime?timeZone=' + timeZone
                }
                return $http(req);
            },

            getCrowdStatusReport: function (timeSlab, timeZone) {
                var req = {
                    method: 'GET',
                    url: 'restapi/report/crowdStatus?timeSlab=' + timeSlab + '&timeZone=' + timeZone
                }
                return $http(req);
            },

            getPingtimeReport: function (timeZone) {
                var req = {
                    method: 'GET',
                    url: 'restapi/report/vehiclePingTime?timeZone=' + timeZone
                }
                return $http(req);
            },

            getPingtimeForBusReport: function (payload) {
                var req = {
                    method: 'GET',
                    //url: 'restapi/report/vehiclePingTime?timeInDays=1&vehicleNo=' + vehicleNo
                    url: 'restapi/report/vehiclePingTime?' + payload
                }
                return $http(req);
            },

            getETAvsATAReport: function (timeZone) {
                var req = {
                    method: 'GET',
                    url: 'restapi/report/shapeTime?timeZone=' + timeZone
                }
                return $http(req);
            },
            getVehiclesAtStop: function (filter) {
                var req = {
                    method: 'POST',
                    url: 'restapi/report/vehicle/getVehiclesAtStop',
                    data: filter
                }
                return $http(req);
            },
            getVehiclePingRate: function (filter) {
                var req = {
                    method: 'POST',
                    url: 'restapi/report/vehicle/getVehiclePingRate.json',
                    data: filter
                }
                return $http(req);
            },
            getVehiclePingTime: function (filter) {
                var req = {
                    method: 'POST',
                    url: 'restapi/report/vehicle/getVehiclePingTime.json',
                    data: filter
                }
                return $http(req);
            },
            getVehicleTripCount: function (filter) {
                var req = {
                    method: 'POST',
                    url: 'restapi/report/vehicle/getVehicleTripCount.json',
                    data: filter
                }
                return $http(req);
            },
            getVehicleMovement: function (filter) {
                var req = {
                    method: 'POST',
                    url: 'restapi/report/vehicle/getVehicleMovement.json',
                    data: filter
                }
                return $http(req);
            },
            getRouteAllocation: function (filter) {
                var req = {
                    method: 'POST',
                    url: 'restapi/report/manage/getRouteAllocation.json',
                    data: filter
                }
                return $http(req);
            },
            getPathViolation: function (filter) {
                var req = {
                    method: 'POST',
                    url: 'restapi/report/violation/getPathViolation.json',
                    data: filter
                }
                return $http(req);
            },
            downloadReportData: function (filter, urlSuffix) {
                var req = {
                    method: 'POST',
                    url:  urlSuffix,
                    responseType: 'arraybuffer',
                    data: filter
                }
                return $http(req);
            }
        };
    }])
    .factory('DashboardService', ['$http', function ($http) {
        return {
            getDashboardStats: function (timeZone) {
                var req = {
                    method: 'GET',
                    url: 'restapi/report/summary/summary?timeZone=' + timeZone
                }
                return $http(req);
            },
            
            getStatistics: function (timeZone) {
                var req = {
                    method: 'GET',
                    url: 'restapi/report/summary/statistics?timeZone=' + timeZone
                }
                return $http(req);
            },

            getStatisticsFilter: function (filter) {
            var req = {
                method: 'POST',
                url: 'restapi/report/summary/statistics/filter',
                data: filter
            }
            return $http(req);
            },
            getRouteDetails: function (filter) {
                var req = {
                    method: 'POST',
                    url: 'restapi/report/summary/statistics/filter/details',
                    data: filter
                }
                return $http(req);
            }

            

        };
    }]);





