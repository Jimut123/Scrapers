angular.module('controlPanelApp').service('SessionService', function ($sessionStorage, Constants) {
    //var _isLoggedIn = false;
    //var _token = '';

    this.setLoggedIn = function (value) {
        $sessionStorage.isLoggedIn = value;
    };

    this.getLoggedIn = function () {
        return $sessionStorage.isLoggedIn;
    };

    this.setUserLogin = function (value) {
        $sessionStorage.userLogin = value;
    };

    this.getUserLogin = function () {
        return $sessionStorage.userLogin;
    };

	
    this.setToken = function (value) {
        //_token = value;
        $sessionStorage.sessionToken = value;
    };

    this.getToken = function () {
        return $sessionStorage.sessionToken;
        //return $sessionStorage.sessionToken;
    };

    this.setUserFullName = function (value) {
        //_token = value;
        $sessionStorage.userFullName = value;
    };

    this.getUserFullName = function () {
        return $sessionStorage.userFullName;
    };
    
    this.setMonferryMenu = function (monferryMenu) {
        $sessionStorage.monferryMenu = monferryMenu;
    };

    this.getMonferryMenu = function () {
        return $sessionStorage.monferryMenu;
    };

    this.setDashboardMenu = function (dashboardMenu) {
    	$sessionStorage.dashboardMenu = dashboardMenu;
    };
	
	this.getDashboardMenu = function() {
		return $sessionStorage.dashboardMenu;
	};
		
	this.setMonMainMenu = function (monMainMenu){
		$sessionStorage.monMainMenu = monMainMenu;
	};
	
	this.getMonMainMenu = function(){
		return $sessionStorage.monMainMenu;
	};
	
	this.setMapViewMenu = function(mapViewMenu){
		$sessionStorage.mapViewMenu = mapViewMenu;
	};
	
	this.getMapViewMenu = function(){
		return $sessionStorage.mapViewMenu;
	};
	
	this.setTableViewMenu = function (tableViewMenu){
		$sessionStorage.tableViewMenu = tableViewMenu;
	};
	
	this.getTableViewMenu = function(){
		return $sessionStorage.tableViewMenu;
	};
	
	this.setMonAmbMenu = function (monAmbMenu){
		$sessionStorage.monAmbMenu = monAmbMenu;
	};
	
	this.getMonAmbMenu = function(){
		return $sessionStorage.monAmbMenu;
	};
	
	this.setMonPolCarMenu = function (monPolCarMenu){
		$sessionStorage.monPolCarMenu = monPolCarMenu;
	};

	
	
	this.getMonPolCarMenu = function(){
		return $sessionStorage.monPolCarMenu;
	};
					
	this.setMonAmbSingleMenu = function(monAmbSingleMenu){
		$sessionStorage.monAmbSingleMenu = monAmbSingleMenu;
	};
	
	this.getMonAmbSingleMenu = function(){
		return $sessionStorage.monAmbSingleMenu;
	};
					
	this.setReportMainMenu = function(reportMainMenu){
		$sessionStorage.reportMainMenu = reportMainMenu;
	};
	
	this.getReportMainMenu = function(){
		return $sessionStorage.reportMainMenu;
	}
	
	this.setTripCountMenu = function(tripCountMenu){
		$sessionStorage.tripCountMenu = tripCountMenu;
	};
	
	this.getTripCountMenu = function(){
        return $sessionStorage.tripCountMenu;
    };
	
	this.setTripTimeMenu = function(tripTimeMenu){
		$sessionStorage.tripTimeMenu = tripTimeMenu;
	};
	
	this.getTripTimeMenu = function(){
        return $sessionStorage.tripTimeMenu;
    };
	
	this.setCrowdMenu = function(crowdMenu){
		$sessionStorage.crowdMenu = crowdMenu;
	};
	
	this.getCrowdMenu = function(){
        return $sessionStorage.crowdMenu;
    };
	
	this.setLatestPingMenu = function(latestPingMenu){
		$sessionStorage.latestPingMenu = latestPingMenu;
	};
	
	this.getLatestPingMenu = function(){
        return $sessionStorage.latestPingMenu;
    };
	
	this.setEtaVsAtaMenu = function(etaVsAtaMenu){
		$sessionStorage.etaVsAtaMenu = etaVsAtaMenu;
	};
	
	this.getEtaVsAtaMenu = function(){
        return $sessionStorage.etaVsAtaMenu;
    }
					
	this.setManageMenu = function(manageMenu){
		$sessionStorage.manageMenu = manageMenu;
	};
	
	this.getManageMenu = function(){
        return $sessionStorage.manageMenu;
    };
	
	this.setUserManageMenu = function (userManageMenu){
		$sessionStorage.userManageMenu = userManageMenu;
	};
	
	this.getUserManageMenu = function(){
        return $sessionStorage.userManageMenu;
    };
	
	this.setPisManageMenu = function (pisManageMenu){
		$sessionStorage.pisManageMenu = pisManageMenu;
	};
	
	this.getPisManageMenu = function () {
	    return $sessionStorage.pisManageMenu;
	};

	this.setUserGroup = function (value) {
	    //_token = value;
	    $sessionStorage.userRole = value;
	};

	this.getUserGroup = function () {
	    return $sessionStorage.userRole;
	};

	this.getAccessAuthorization = function (menuItem) {
	    var _isAccessible = false;

	    switch (this.getUserGroup()) {
	        case Constants.ROLE_ADMIN:
	            _isAccessible = ['dashboardMenu', 'monMainMenu', 'mapViewMenu', 'monAmbMenu', 'monPolCarMenu', 'reportMainMenu', 'latestPingMenu', 'etaVsAtaMenu', 'manageMenu', 'userManageMenu', 'pisManageMenu', 'busCrossedStopMenu', 'busCrossedNodeMenu', 'busDataPacketMenu', 'busTripMenu', 'busMovementMenu', 'routeAllocReportMenu', 'outOfPathBusReportMenu','monferryMenu'].contains(menuItem);
	            break;
	        case Constants.ROLE_SUPERADMIN:
	            _isAccessible = true;
	            break;
	        case Constants.ROLE_NODAL_AGENCY:
	            _isAccessible = ['monMainMenu', 'monAmbMenu'].contains(menuItem);
	            break;
	        case Constants.ROLE_POLICE:
	            _isAccessible = ['monMainMenu', 'monAmbMenu', 'monPolCarMenu'].contains(menuItem);
	            break;
	        case Constants.ROLE_USER:
	            _isAccessible = ['dashboardMenu', 'monMainMenu', 'mapViewMenu', 'reportMainMenu', 'latestPingMenu', 'busCrossedStopMenu', 'busCrossedNodeMenu', 'busDataPacketMenu', 'busTripMenu', 'busMovementMenu', 'routeAllocReportMenu', 'outOfPathBusReportMenu'].contains(menuItem);
	            break;
	        case Constants.ROLE_ALL_VEHICLE:
	            _isAccessible = ['dashboardMenu', 'monMainMenu', 'mapViewMenu', 'monAmbMenu', 'reportMainMenu', 'latestPingMenu', 'busCrossedStopMenu', 'busCrossedNodeMenu', 'busDataPacketMenu', 'busTripMenu', 'busMovementMenu', 'routeAllocReportMenu', 'outOfPathBusReportMenu'].contains(menuItem);
	            break;
	       
	    }

	    return _isAccessible;
	};

	this.getAccessibleState = function (stateName) {
	    var _isAccessible = false;
	    switch (this.getUserGroup()) {
	        case Constants.ROLE_ADMIN:
	            _isAccessible = ['login', 'home', 'home.man_user', 'home.man_depot', 'home.man_route', 'home.mon_map', 'home.rep_latestPing', 'home.mon_amb', 'home.mon_polcar', 'home.man_pis', 'home.single_pis', 'home.amb_requi', 'home.rep_busCrossStop', 'home.rep_busCrossNode', 'home.rep_busDataPacket', 'home.rep_busTrip', 'home.rep_busMovement', 'home.rep_routeAlloc', 'home.rep_outofPathBus', 'home.mon_ferry'].contains(stateName);
	            break;
	        case Constants.ROLE_SUPERADMIN:
	            _isAccessible = true;
	            break;
	        case Constants.ROLE_NODAL_AGENCY:
	            _isAccessible = ['login', 'home.mon_amb'].contains(stateName);
	            break;
	        case Constants.ROLE_POLICE:
	            _isAccessible = ['login', 'home.mon_amb', 'home.mon_polcar'].contains(stateName);
	            break;
	        case Constants.ROLE_USER:
	            _isAccessible = ['login', 'home', 'home.mon_map', 'home.rep_latestPing', 'home.rep_busCrossStop', 'home.rep_busCrossNode', 'home.rep_busDataPacket', 'home.rep_busTrip', 'home.rep_busMovement', 'home.rep_routeAlloc', 'home.rep_outofPathBus'].contains(stateName);
	            break;
	        case Constants.ROLE_ALL_VEHICLE:
	            _isAccessible = ['login', 'home', 'home.mon_map', 'home.mon_amb', 'home.rep_latestPing', 'home.rep_busCrossStop', 'home.rep_busCrossNode', 'home.rep_busDataPacket', 'home.rep_busTrip', 'home.rep_busMovement', 'home.rep_routeAlloc', 'home.rep_outofPathBus'].contains(stateName);
	            break;
	        default:
	            _isAccessible = false;
	    }

	    return _isAccessible;
	};

	this.getDefaultAccessibleState = function () {
	    var _stateName = 'home';
	    switch (this.getUserGroup()) {
	        case Constants.ROLE_ADMIN:
	            _stateName = 'home';
	            break;
	        case Constants.ROLE_SUPERADMIN:
	            _stateName = 'home';
	            break;
	        case Constants.ROLE_NODAL_AGENCY:
	            _stateName = 'home.mon_amb';
	            break;
	        case Constants.ROLE_POLICE:
	            _stateName = 'home.mon_amb';
	            break;
	        case Constants.ROLE_USER:
	            _stateName = 'home';
	            break;
	        case Constants.ROLE_ALL_VEHICLE:
	            _stateName = 'home';
	            break;
	        default:
	            _stateName = 'home';
	    }

	    return _stateName;
	};
}).factory('AuthService', ['$http', function ($http) {
    var factory = {};

    factory.login = function (credential) {
        var req = {
            method: 'POST',
            url: 'restapi/auth/login',
            data: credential,
        }
        return $http(req);
    }

    factory.logout = function (sessionToken) {
        var req = {
            method: 'POST',
            url: 'restapi/auth/logout',
            data: sessionToken,
        }
        return $http(req);
    }
	
    factory.validatePassword = function (credential) {
        var req = {
            method: 'POST',
            url: 'restapi/auth/validatePassword',
            data: credential,
        }
        return $http(req);
    }
	
	factory.changePassword = function (credential) {
        var req = {
            method: 'POST',
            url: 'restapi/auth/changePassword',
            data: credential,
        }
        return $http(req);
    }

    return factory;
}]).factory('sessionInjector', ['$q', 'SessionService', '$location', '$sessionStorage', function ($q, SessionService, $location, $sessionStorage) {
    var sessionInjector = {
        request: function (config) {
            console.log('within request interceptor');
            config.headers['sessionToken'] = '';
            if (SessionService.getLoggedIn()) {
                config.headers['sessionToken'] = SessionService.getToken();
            } 
            return config;
        },
        response: function (response) {
            //console.log('within response interceptor');
            return response || $q.when(response);
        },
        responseError: function (rejection) {
            console.log('within response error interceptor');
            console.log(rejection);
            //if session expired or server authentication failed
            if (rejection.status === 401) {
                //clear all item from session storage
                $sessionStorage.$reset();
                //$location.path('/sessionexpmsg');
                $location.path('/login');
            }
            return $q.reject(rejection);
        }
    };
    return sessionInjector;
}]).factory('timestampMarker', [function () {
    var timestampMarker = {
        request: function (config) {
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function (response) {
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
    return timestampMarker;
}]);

angular.module('controlPanelApp').config(['$httpProvider', function ($httpProvider) {
    //$httpProvider.interceptors.push('timestampMarker');
    $httpProvider.interceptors.push('sessionInjector');
}]);


