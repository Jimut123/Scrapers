/**
 * Created by Aditya on 06-Apr-17.
 */

angular.module('controlPanelApp')
    .factory('AmbulanceService', ['$http', function ($http) {
    return {
        getAmbulanceRequisition: function (payload) {
            var req = {
                method: 'GET',
                url: 'restapi/booking/getBookingInfo/' + payload
            }
            return $http(req);
        },
        saveAmbulanceRequisition: function (payload) {
            var req = {
                method: 'POST',
                url: 'restapi/booking/updateBooking',
                data: payload
            }
            return $http(req);
        },
        cancelBooking: function (payload) {
            var req = {
                method: 'GET',
                url: 'restapi/booking/cancelBooking/' + payload
            }
            return $http(req);
        }
    }
}]);
