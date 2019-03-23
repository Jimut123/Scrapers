/**
 * Created by Debkumar on 19-Sept-17.
 */

angular.module('controlPanelApp')
    .factory('PoliceCarService', ['$http', function ($http) {
    return {
    	getPoliceStation: function (agencyName) {
            var req = {
                method: 'GET',
                url: 'restapi/police/getPoliceStation/' + agencyName
            }
            return $http(req);
        }
    }
}]);
