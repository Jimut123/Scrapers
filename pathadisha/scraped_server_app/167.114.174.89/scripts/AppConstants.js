angular.module('controlPanelApp')
.constant('Constants', {
    'ONLINE_STATUS_CHECK_INTERVAL': 10,
    'ALERT_REFRESH_INTERVAL': 5,

    //role constant
    'ROLE_ADMIN': 'ROLE_ADMIN',
    'ROLE_SUPERADMIN': 'ROLE_SUPERADMIN',
    'ROLE_NODAL_AGENCY': 'ROLE_NODAL_AGENCY',
    'ROLE_POLICE': 'ROLE_POLICE',
    'ROLE_USER': 'ROLE_USER',
    'ROLE_ALL_VEHICLE': 'ROLE_ALL_VEHICLE',

   
    'DEFAULT_ZOOM': 12,
    'DASHBOARD_REFRESH_INTERVAL': 60,
    'MODAL_MAP_ZOOM': 15,
    'VEHICLE_LOC_REFRESH_INTERVAL': 10,

    'NO_DATA_FOUND': 'No Data Found',
    'LOADING': 'Loading...',

    ReportFileType: {
        'PDF': 'PDF',
        'EXCEL': 'EXCEL'
    },

    DefaultBound: { lat: 22.568947, lng: 88.430707, zoom: 16 },

    // MomentPicker Date format
    'MP_DATE_FORMAT': "DD-MM-YYYY hh:mm tt",
    'MP_DATE_ONLY_FORMAT': "DD-MM-YYYY",
    'API_BASE_URL': 'http://transport.ideationts.com:8080/'
    //'API_BASE_URL' : 'http://uat.ideationts.com:8080/'

});