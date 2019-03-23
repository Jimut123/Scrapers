/**
 * Created by Aditya on 18-Apr-17.
 */
angular.module('controlPanelApp')
    .factory('MiscServices', function (Constants) {
        return {
            selectize: function (bigArray, bigId, smallArray, smallId) {
                var returnArray = JSON.parse(JSON.stringify(bigArray))
                for (var i = 0; i < smallArray.length; i++) {
                    if (smallArray[i][smallId] != undefined) {
                        for (var j = 0; j < returnArray.length; j++) {
                            if (returnArray[j][bigId] != undefined) {
                                if (returnArray[j][bigId] === smallArray[i][smallId]) {
                                    returnArray[j]._selected = true;
                                } else {
                                    if (returnArray[j]._selected != true) {
                                        returnArray[j]._selected = false;
                                    }
                                }
                            }
                        }
                    }
                }
                return returnArray;
            },
            distanceBwPoints: function distance(lat1, lon1, lat2, lon2, unit) {
                var radlat1 = Math.PI * lat1 / 180
                var radlat2 = Math.PI * lat2 / 180
                var theta = lon1 - lon2
                var radtheta = Math.PI * theta / 180
                var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                dist = Math.acos(dist)
                dist = dist * 180 / Math.PI
                dist = dist * 60 * 1.1515
                if (unit == "K") {
                    dist = dist * 1.609344
                }
                if (unit == "N") {
                    dist = dist * 0.8684
                }
                if (unit == "MT") {
                    dist = (dist * 1.609344) * 1000
                }
                return dist
            },
            getSelectedValues: function (obj, fieldName) {
                var arr = [];
                if (obj !== null && !angular.isUndefined(obj)) {
                    if (angular.isArray(obj)) {

                        arr = obj.map(function (r) {
                            return r[fieldName];
                        });

                    } else {
                        if (!angular.isUndefined(obj[fieldName]))
                            arr = [obj[fieldName]];
                    }
                }

                return arr;
            },
            generateReportFileName: function (prefix, fileType) {
                console.log('fileType', fileType);
                var extension = '.txt';
                if (fileType == Constants.ReportFileType.PDF) {
                    extension = '.pdf';
                } else if (fileType == Constants.ReportFileType.EXCEL) {
                    extension = '.xls';
                }
                var now = new Date();
                var _reportFileName = prefix + '_' + now.getDate().pad(2) + (now.getMonth() + 1).pad(2) + now.getFullYear() + '_' + now.getHours() + now.getMinutes() + now.getSeconds() + extension;
                return _reportFileName;
            }


        };
    });