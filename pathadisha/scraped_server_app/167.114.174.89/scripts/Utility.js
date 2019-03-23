/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// arr1 and arr2 are arrays of any length; equalityFunc is a function which
// can compare two items and return true if they're equal and false otherwise
function arrayUnion(arr1, arr2, equalityFunc) {
    var union = arr1.concat(arr2);

    for (var i = 0; i < union.length; i++) {
        for (var j = i + 1; j < union.length; j++) {
            if (equalityFunc(union[i], union[j])) {
                union.splice(j, 1);
                j--;
            }
        }
    }

    return union;
}

function areRouteEqual(g1, g2) {
    return g1.routeId === g2.routeId;
}


function longToTime(lngDate) {
    var d = new Date(lngDate);
    var hours = d.getHours();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    var dformat = [hours.padLeft(),
            d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':') + ' ' + ampm;

    return dformat;
}

function getCustomBound(locations, mapWidth, mapHeight) {
    var zoomLevel = 0;
    var maxLat = -85;
    var minLat = 85;
    var maxLng = -180;
    var minLng = 180;
    var buffer = 20;

    //calculate bounding rectangle

    angular.forEach(locations, function (item, index) {
        if (item.pointLat != null && item.pointLng != null) {
            if (item.pointLat > maxLat) {
                maxLat = item.pointLat;
            }

            if (item.pointLat < minLat) {
                minLat = item.pointLat;
            }

            if (item.pointLng > maxLng) {
                maxLng = item.pointLng;
            }

            if (item.pointLng < minLng) {
                minLng = item.pointLng;
            }
        }

    }, null);

    var centerLat = (maxLat + minLat) / 2;
    var centerLng = (maxLng + minLng) / 2;

    var zoom1 = 0, zoom2 = 0;

    //Determine the best zoom level based on the map scale and bounding coordinate information
    if (maxLng != minLng && maxLat != minLat) {
        //best zoom level based on map width
        zoom1 = Math.log(360.0 / 256.0 * (mapWidth - 2 * buffer) / (maxLng - minLng)) / Math.log(2);
        //best zoom level based on map height
        zoom2 = Math.log(180.0 / 256.0 * (mapHeight - 2 * buffer) / (maxLat - minLat)) / Math.log(2);
    }

    //use the most zoomed out of the two zoom levels
    zoomLevel = (zoom1 < zoom2) ? zoom1 : zoom2;

    var customBound = { "lat": centerLat, "lng": centerLng, "zoom": Math.ceil(zoomLevel) };

    //validate zoom level of custom bound.
    if (isNaN(customBound.zoom)) {
        customBound.zoom = 12;
    }

    return customBound;
}


function convertDate() {
    var date = new Date();

    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}


Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
function getPageSizeList() {
    return [
      { value: '10', name: 'Page Size 10' },
	  { value: '15', name: 'Page Size 15' },
      { value: '25', name: 'Page Size 25' },
      { value: '50', name: 'Page Size 50' },
      { value: '100', name: 'Page Size 100' }
    ];
}

function ArmisDateParse(datestr, format) {
    if (datestr === undefined || datestr === null)
        //return new Date();
        return undefined;

    try {
        switch (format) {
            case "DD-MM-YYYY hh:mm tt": {
                console.log('datestr', datestr);
                var dte = datestr.split(' ')[0];
                var h = datestr.split(' ')[1].split(':')[0];
                var m = datestr.split(' ')[1].split(':')[1];

                switch (datestr.split(' ')[2].toUpperCase()) {
                    case "AM": {
                        if (h == "12")
                            h = "00";
                    } break;

                    case "PM": {
                        if (h != "12")
                            h = eval(h) + 12;
                    } break;
                }
                return new Date(dte.split('-')[2], eval(dte.split('-')[1]) - 1, dte.split('-')[0], h, m)
            }
            case "DD-MM-YYYY": {
                console.log('datestr', datestr);
                var dte = datestr.split(' ')[0];
                var h = 00;
                var m = 00;
                return new Date(dte.split('-')[2], eval(dte.split('-')[1]) - 1, dte.split('-')[0], h, m)
            }
        }
    } catch (e) {
        return new Date();
    }
}

function getPageSizeList() {
    return [
      { value: '10', name: 'Page Size 10' },
      { value: '15', name: 'Page Size 15' },
      { value: '25', name: 'Page Size 25' },
      { value: '50', name: 'Page Size 50' },
      { value: '100', name: 'Page Size 100' }
    ];
}

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

function generateReportSerialNo(arr, pageNo, pageSize, zeroBaseIndex) {
    if (arr != null && arr.length > 0) {
        var startSrlNo = 0;
        if (zeroBaseIndex) {
            startSrlNo = (pageNo) * pageSize + 1;
        } else {
            startSrlNo = (pageNo - 1) * pageSize + 1;
        }

        for (var i = 0; i < arr.length; i++) {

            arr[i].srlNo = startSrlNo + i;
        }
    }
}

function getMapBoundaries(bounds) {
    var arr = [];
    if (typeof (bounds) !== 'undefined' && typeof (bounds.northEast) !== 'undefined') {
        arr.push({ lat: bounds.northEast.lat, lng: bounds.southWest.lng });
        arr.push({ lat: bounds.northEast.lat, lng: bounds.northEast.lng });
        arr.push({ lat: bounds.southWest.lat, lng: bounds.northEast.lng });
        arr.push({ lat: bounds.southWest.lat, lng: bounds.southWest.lng });
    }

    return arr;
}

function isPointInsidePolygon(lat, lng, polyPoints) {
    var x = lat;
    var y = lng;

    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};
