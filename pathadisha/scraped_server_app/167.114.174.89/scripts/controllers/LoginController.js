/**
 * Created by Ideation on 24-01-2017.
 */

angular.module('controlPanelApp').controller('LoginController', LoginController);

function LoginController($scope, AuthService, $state, SessionService, $timeout, $localStorage, md5, $rootScope, $sessionStorage) {

    $scope.isRememberChecked = false;
    $scope.loginErrMsg = "";
    $scope.loginInProgress = false;

    close_splash_screen();

    $scope.userLogin = function () {
        $scope.loginErrMsg = "";
        var credentials = {
            userLogin: $scope.loginCredential.userLogin,
            userPassword: md5.createHash($scope.loginCredential.userPassword || '')
        };
        $scope.loginInProgress = true;
        AuthService.login(credentials)
            .then(function (response) {
                if (response.status === 200) {

                    if ($scope.isRememberChecked) {
                        $localStorage.isRememberChecked = $scope.isRememberChecked;
                    } else {

                    }
                    $sessionStorage.loggedInUser = response.data;
                    SessionService.setLoggedIn(true);
                    SessionService.setUserLogin(response.data.userLogin);
					SessionService.setToken(response.data.sessionToken);
                    SessionService.setUserFullName((response.data.userFname + " " + response.data.userLName).trim());
                    SessionService.setUserGroup(response.data.accountGroup);
                    
                    $rootScope.userFullName = SessionService.getUserFullName();
                    
                    $state.transitionTo(SessionService.getDefaultAccessibleState());
					
                } else {
                    $scope.loginErrMsg = "Invalid username or password.";
                    $scope.loginCredential = {userName: '', password: ''};
                    $timeout(function () {
                        angular.element(document.querySelector('#txtUserName')).focus();
                    }, 500);
                }

            }, function (err) {
                $scope.loginErrMsg = "Invalid username or password.";
                $scope.loginCredential = {userName: '', password: ''};
                $timeout(function () {
                    $scope.loginInProgress = false;
                    angular.element(document.querySelector('#txtUserName')).focus();
                }, 100);
                console.log(err);
            });
    }
};

angular.module('controlPanelApp').controller('SessionExpMsgController', SessionExpMsgController);

function SessionExpMsgController($scope, $mdDialog) {

    $scope.showAlert = function (ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(false)
                .title('Session has expired!')
                .textContent('User Session has expired! Login to continue.')
                .ariaLabel('Alert')
                .ok('Got it!')
                .targetEvent(ev)
        );
    };

    $scope.showAlert();

}
