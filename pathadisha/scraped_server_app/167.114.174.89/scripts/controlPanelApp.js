angular.module('controlPanelApp', ['ui.router', 'ui.bootstrap', 'angular-md5', 'ngStorage', 'leaflet-directive', 'ngResource', 'smart-table', 'angucomplete-alt', 'ui.sortable', 'pageslide-directive', 'angularjs-datetime-picker', 'ngSanitize', 'ngCsv', 'ui.select', 'ideation-switch', 'amChartsDirective', 'moment-picker'])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
        // .when('/home' , '/dash')
            .otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: "LoginController"
            })
            .state('home', {
                url: '/home',
                templateUrl: 'views/home.html',
                controller: DashboardController,
                controllerAs: 'dashCtrl',
                authenticate: true
            })
            .state('home.man_user', {
                url: '/man_user',
                templateUrl: 'views/nestedViews/users.html',
                controller: UserController,
                controllerAs: 'usrCtrl',
                authenticate: true
            })
            .state('home.man_depot', {
                url: '/man_depot',
                templateUrl: 'views/nestedViews/addDepotRouteStop.html',
                controller: 'DepotRouteStopController',
                controllerAs: 'DRSCtrl',
                authenticate: true
            })
            .state('home.man_route', {
                url: '/man_route',
                templateUrl: 'views/nestedViews/route.html',
                controller: RouteController,
                controllerAs: 'RCtrl',
                authenticate: true
            })
            .state('home.mon_map', {
                url: '/mon_map',
                templateUrl: 'views/nestedViews/monitoring.html',
                controller: MonitoringController,
                controllerAs: 'mpCtrl',
                authenticate: true
            })
            //.state('home.mon_table', {
            //    url: '/mon_table',
            //    templateUrl: 'views/nestedViews/monitoringtable.html',
            //    controller: MonitoringTableController,
            //    controllerAs: 'mtCtrl',
            //    authenticate: true
            //})
            .state('home.rep_latestPing', {
                url: '/rep_latestPing',
                templateUrl: 'views/nestedViews/reports/latestping.html',
                controller: LatestPingReportController,
                controllerAs: 'lpRptCtrl',
                authenticate: true
            })
            //.state('home.rep_etaAta', {
            //    url: '/rep_etaAta',
            //    templateUrl: 'views/nestedViews/etavsatareport.html',
            //    controller: ReportController,
            //    controllerAs: 'rptCtrl',
            //    authenticate: true
            //})
            .state('home.mon_amb', {
                url: '/mon_amb',
                templateUrl: 'views/nestedViews/ambulance.html',
                controller: AmbulanceController,
                controllerAs: 'ambCtrl',
                authenticate: true
            })
            .state('home.mon_polcar', {
                url: '/mon_polcar',
                templateUrl: 'views/nestedViews/policecar.html',
                controller: PoliceCarController,
                controllerAs: 'polcarCtrl',
                authenticate: true
            })
            .state('home.man_pis', {
                url: '/man_pis',
                templateUrl: 'views/nestedViews/pismgmt.html',
                controller: PISController,
                controllerAs: 'pisCtrl',
                authenticate: true
            })
         .state('home.single_pis', {
             url: '/single_pis',
             templateUrl: 'views/nestedViews/pisconfiguration.html',
             controller: PISConfigController,
             controllerAs: 'pisAddCtrl',
             authenticate: true
         }).state('home.amb_requi', {
             url: '/amb_requi',
             templateUrl: 'views/nestedViews/ambulancerequisition.html',
             controller: AmbRequisitionController,
             controllerAs: 'abrCtrl',
             authenticate: true
         }).state('home.rep_busCrossStop', {
             url: '/rep_busCrossStop',
             templateUrl: 'views/nestedViews/reports/busescrossedstop.html',
             controller: BusesCrossedStopReportController,
             controllerAs: 'bcsrCtrl',
             authenticate: true
         }).state('home.rep_busCrossNode', {
             url: '/rep_busCrossNode',
             templateUrl: 'views/nestedViews/reports/busescrossedpisnode.html',
             controller: BusesCrossedPISNodeReportController,
             controllerAs: 'bcpnrCtrl',
             authenticate: true
         }).state('home.rep_busDataPacket', {
             url: '/rep_busDataPacket',
             templateUrl: 'views/nestedViews/reports/busdatapacket.html',
             controller: BusDataPacketReportController,
             controllerAs: 'bdpCtrl',
             authenticate: true
         }).state('home.rep_busTrip', {
             url: '/rep_busTrip',
             templateUrl: 'views/nestedViews/reports/bustrip.html',
             controller: BusTripsReportController,
             controllerAs: 'btCtrl',
             authenticate: true
         }).state('home.rep_busMovement', {
             url: '/rep_busMovement',
             templateUrl: 'views/nestedViews/reports/busmovement.html',
             controller: BusMovementReportController,
             controllerAs: 'bmCtrl',
             authenticate: true
         }).state('home.rep_routeAlloc', {
             url: '/rep_routeAlloc',
             templateUrl: 'views/nestedViews/reports/routeallocation.html',
             controller: RouteAllocationReportController,
             controllerAs: 'rarCtrl',
             authenticate: true
//         }).state('home.rep_outofPathBus', {
//             url: '/rep_outofPathBus',
//             templateUrl: 'views/nestedViews/reports/outofpathbus.html',
//             controller: OutofPathBusReportController,
//             controllerAs: 'opbCtrl',
//             authenticate: true
         }).state('home.mon_ferry', {
             url: '/mon_ferry',
             templateUrl: 'views/nestedViews/ferry.html',
             controller: FerryController,
             controllerAs: 'ferryCtrl',
             authenticate: true
         });
    })
    .config(['stConfig', function (stConfig) { stConfig.sort.delay = 200; stConfig.pipe.delay = 400; }])
    .run(function ($rootScope, $state, SessionService, $transitions, $templateCache, $sessionStorage, $timeout) {

        console.log('within run', $sessionStorage.stateName);

        //$sessionStorage.firstLoad = true;

        $transitions.onStart({}, function (transition) {
            console.log('onStart', transition);
            console.log('tostate', transition._targetState._definition.name);


            if (angular.isUndefined($sessionStorage.isLoggedIn)) {
                $sessionStorage.$reset();
                $state.transitionTo("login");
            }

            if (transition._targetState._definition.name === 'login') {
                return true;
            }

            if (angular.isDefined($sessionStorage.isLoggedIn)) {
                if (!SessionService.getAccessibleState(transition._targetState._definition.name)) {
                    console.log('user try to access non accessible state', transition._targetState._definition.name);
                    console.log('default state for this user', SessionService.getDefaultAccessibleState());
                    $state.transitionTo(SessionService.getDefaultAccessibleState());
                }
            }

            console.log('state transition', transition._targetState._definition.name, SessionService.getAccessibleState(transition._targetState._definition.name));

            //if (['home', 'home.dbd_installstatus', 'home.dbd_autocount', 'home.dbd_meterusage', 'home.dbd_afmstatus'].contains(transition._targetState._definition.name)) {

            //    $rootScope.isDashboardView = true;

            //} else {
            //    $rootScope.isDashboardView = false;
            //}




            return SessionService.getAccessibleState(transition._targetState._definition.name);
        });

        $transitions.onBefore({}, function (transition) {
            console.log('onBefore', transition._targetState._definition.name);
            //Template gets downloaded in every state transition
            $templateCache.remove($state.current.templateUrl);

        });
        //$transitions.onEnter({  }, function (transition) {
        //    console.log('onEnter');
        //});
        //$transitions.onError({  }, function (transition) {
        //    console.log('onError', transition);
        //});
        //$transitions.onExit({  }, function (transition) {
        //    console.log('onExit');
        //});
        //$transitions.onFinish({  }, function (transition) {
        //    console.log('onFinish');
        //});
        //$transitions.onRetain({  }, function (transition) {
        //    console.log('onRetain');
        //});

        $transitions.onSuccess({}, function (transition) {
            console.log('onSuccess');

            //if (!angular.isUndefined($sessionStorage.firstLoad) && $sessionStorage.firstLoad) {
            //    if (!angular.isUndefined($sessionStorage.stateName)) {
            //        //transition.abort();
            //        var tempVar = $sessionStorage.stateName;
            //        $timeout(function () {
            //            $state.transitionTo(tempVar);
            //        }, 500);

            //    }
            //}

            $sessionStorage.firstLoad = false;
            $sessionStorage.stateName = transition._targetState._definition.name;

        });



    })
    .config(['momentPickerProvider', function (momentPickerProvider) {
        momentPickerProvider.options({
            /* Picker properties */
            //locale: 'en',
            format: 'DD-MM-YYYY LT',  //for 12 hour time format
            //format: 'DD-MM-YYYY HH:mm', //for 24 hour time format
            minView: 'decade',
            maxView: 'minute',
            startView: 'month',
            autoclose: true,
            today: false,
            keyboard: true,

            /* Extra: Views properties */
            leftArrow: '&larr;',
            rightArrow: '&rarr;',
            yearsFormat: 'YYYY',
            monthsFormat: 'MMM',
            daysFormat: 'D',
            hoursFormat: 'HH:[00]',
            //minutesFormat: moment.localeData().longDateFormat('LT').replace(/[aA]/, ''),
            //minutesFormat: 'HH:mm', //for 24 hour time format //for 12 hour commant this line
            secondsFormat: 'ss',
            minutesStep: 5,
            secondsStep: 1

        });
    }])
    .directive('myEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    }).directive('stFilteredCollection', function () {
        return {
            require: '^stTable',
            link: function (scope, element, attr, ctrl) {
                scope.$watch(ctrl.getFilteredCollection, function (val) {
                    scope.filteredCollection = val;
                })
            }
        }
    }).directive("itsSearch", ['stConfig', '$timeout', '$parse', function (stConfig, $timeout, $parse) {
        /* Like st-search, but relies on the value of ng-model to trigger changes.
         * Usage:
         * <input type="text" placeholder="Search..." ng-model="myCtrl.searchParams.search" its-search="search" />
         */
        return {
            require: ['^stTable', 'ngModel'],
            link: function (scope, element, attr, ctrls) {
                var tableCtrl = ctrls[0],
                    modelCtrl = ctrls[1];
                var promise = null;
                var throttle = attr.stDelay || stConfig.search.delay;

                function triggerSearch() {
                    console.log('Search Triggered');
                    var value = modelCtrl.$modelValue;
                    console.log('Search Triggered', value);
                    if (promise !== null) {
                        $timeout.cancel(promise);
                    }

                    promise = $timeout(function () {
                        tableCtrl.search(value, attr.itsSearch || '');
                        promise = null;
                    }, throttle);
                }

                scope.$watch(function () { return modelCtrl.$modelValue; }, triggerSearch);
            }
        };
    }]);




