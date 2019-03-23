/**
 * Created by Aditya on 09-Mar-17.
 */

var stop_name;
angular.module('controlPanelApp').controller('AmbRequisitionController', AmbRequisitionController);

function AmbRequisitionController(AmbulanceService, $timeout, $filter, $scope, $localStorage, $state, $sessionStorage) {
    var self = this;
    //scope variable declaration
    
    self.allCategory = [{ "categoryName": "A", categoryDescription: "Critical", "ticked": false }, { "categoryName": "B", categoryDescription: "Less Critical", "ticked": true }, { "categoryName": "C", categoryDescription: "Normal", "ticked": false }];
    self.selectedCategory = [];

    $scope.msg = '';
    $scope.ambulanceStatus = $sessionStorage.ambulanceStatus;
    $scope.startTime = new Date();
    $scope.isSaving = false;
   

    $scope.ambRequisition = {
        "nodalAgencyName": $sessionStorage.selectedAmbulanceAgency,
        "registrationNumber": $sessionStorage.selectedAmbulanceNo,
        "source": "",
        "destination": "",
        "startTime": $scope.startTime,
        "patientName": "",
        "patientContactNo": "",
        "patientAddress": "",
        "driverName": "",
        "driverPhoneNo": "",
        "tripCategory": "B",
        "greenCorridor": false,
        "goldenTime": 0,
        "comments": ""
    }

 
    if ($scope.ambulanceStatus === 'B') {
        loadAmbulanceData();
    }

    function loadAmbulanceData() {
        var payload = $sessionStorage.selectedAmbulanceNo;

        AmbulanceService.getAmbulanceRequisition(payload).then(
             function (response) {
                 //console.log('response after loading', response);

                 if (response.data.data != null && response.data.data.length > 0) {

                     var reqiObj = response.data.data[0];

                     $scope.ambRequisition.nodalAgencyName = reqiObj.nodalAgency.nodalAgencyName;
                     if (reqiObj.vehicleAdditionalInfo != null) {
                         $scope.ambRequisition.source = reqiObj.vehicleAdditionalInfo.source;
                         $scope.ambRequisition.destination = reqiObj.vehicleAdditionalInfo.destination;
                         $scope.startTime = new Date(reqiObj.vehicleAdditionalInfo.startTime);
                         $scope.ambRequisition.patientName = reqiObj.vehicleAdditionalInfo.patientName;
                         $scope.ambRequisition.patientContactNo = reqiObj.vehicleAdditionalInfo.patientContactNo;
                         $scope.ambRequisition.driverName = reqiObj.vehicleAdditionalInfo.driverName;
                         $scope.ambRequisition.driverPhoneNo = reqiObj.vehicleAdditionalInfo.driverPhoneNo;
                         $scope.ambRequisition.tripCategory = reqiObj.vehicleAdditionalInfo.tripCategory;
                         $scope.ambRequisition.greenCorridor = reqiObj.vehicleAdditionalInfo.greenCorridor;
                         $scope.ambRequisition.goldenTime = Number.parseInt(reqiObj.vehicleAdditionalInfo.goldenTime);
                         $scope.ambRequisition.comments = reqiObj.vehicleAdditionalInfo.comments;

                         for (var i = 0; i < self.allCategory.length; i++) {

                             if (self.allCategory[i].categoryName === reqiObj.vehicleAdditionalInfo.tripCategory) {
                                 self.allCategory[i].ticked = true;
                             } else {
                                 self.allCategory[i].ticked = false;
                             }
                         }

                         if ($scope.ambRequisition.tripCategory === "A") {
                             $scope.isCritical = true;
                         } 
                         
                     }
                     

                 }
                 

             },
             function (err) {
                 //console.log('get all stops in run failed.');
                 console.log(err);
             }
         );

    }
    
    $scope.cancel = function (cancel) {
        $sessionStorage.ambReqiNo = $sessionStorage.selectedAmbulanceNo;
       $state.go('home.mon_amb');
   };

    $scope.saveConfig = function (save) {

        //validation...
        checkValidation();
        console.log($scope.ambRequisition);

        if ($scope.validationMsg !== null && $scope.validationMsg.length > 0) {

            var validationModal = angular.element(document.querySelector('#validationModal'));
            validationModal.modal('show');
            return;
        }
        //console.log('requisition', $scope.ambRequisition);
        $scope.ambRequisition.tripCategory = self.selectedCategory[0].categoryName;
        $scope.ambRequisition.startTime = $scope.startTime.getTime();

        $scope.isSaving = true;
        AmbulanceService.saveAmbulanceRequisition($scope.ambRequisition).then(
              function (response) {
                  console.log('response after ambulance requisition', response);
                  $scope.msg = "Ambulance (" + response.data.bookingId + ") booked successfully.";

                  var messageModal = angular.element(document.querySelector('#messageModal'));
                  messageModal.modal('show');

              },
              function (err) {
                  //console.log('get all stops in run failed.');
                  console.log(err);
              }
          );
    };

    $scope.msgBoxClose = function () {
        var messageModal = angular.element(document.querySelector('#messageModal'));
        messageModal.modal('hide');
        $sessionStorage.ambReqiNo = $sessionStorage.selectedAmbulanceNo;
        $timeout(function () { $state.go('home.mon_amb'); }, 500);
        
    }


    function isEqual(actual, expected) { return angular.equals(actual, expected) };

    Array.prototype.unique = function () {
        var a = this.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

        return a;
    };

    //////////////////////
    $scope.onCategorySelection = function () {
        //console.log("Arnab", self.selectedCategory.categoryName);
        if (self.selectedCategory.categoryName === "A") {

            $scope.isCritical = true;

        } else {
            $scope.isCritical = false;

            $scope.ambRequisition.greenCorridor = false;
            $scope.ambRequisition.goldenTime = "";
        }
    }


    $scope.greenCorridor = function () {

        if (!$scope.ambRequisition.greenCorridor) {
            $scope.ambRequisition.goldenTime = "";
        }
    }

    function checkValidation() {
        $scope.validationMsg = "";

        if ($scope.ambRequisition.driverPhoneNo !== null && $scope.ambRequisition.driverPhoneNo.length > 0) {
            //do nothing
        } else {
            $scope.validationMsg = $scope.validationMsg + "<div>Provide driver contact number.</div>";
        }

        if ($scope.ambRequisition.source !== null && $scope.ambRequisition.source.length > 0) {
            //do nothing
        } else {
            $scope.validationMsg = $scope.validationMsg + "<div>Provide source address.</div>";
        }

        if ($scope.ambRequisition.destination !== null && $scope.ambRequisition.destination.length > 0) {
            //do nothing
        } else {
            $scope.validationMsg = $scope.validationMsg + "<div>Provide destination address.</div>";
        }

        if ($scope.ambRequisition.tripCategory !== null && $scope.ambRequisition.tripCategory === "A") {
            if ($scope.ambRequisition.greenCorridor !== null && $scope.ambRequisition.greenCorridor === true) {
                console.log($scope.ambRequisition.goldenTime);
                if ($scope.ambRequisition.goldenTime == "" || $scope.ambRequisition.goldenTime === null) {
                    if (!isNaN($scope.ambRequisition.goldenTime)) {
                        $scope.validationMsg = $scope.validationMsg + "<div>Provide green corridor time in minutes.</div>";
                    }
                }
            }
        }
        
    }
   
    // Initialize multiple switches
    if (Array.prototype.forEach) {
        var elems = Array.prototype.slice.call(document.querySelectorAll('.switchery'));
        elems.forEach(function (html) {
            var switchery = new Switchery(html, { color: '#4a89dc' });
        });
    }
    else {
        var elems = document.querySelectorAll('.switchery');
        for (var i = 0; i < elems.length; i++) {
            var switchery = new Switchery(elems[i], { color: '#4a89dc' });
        }
    }

}

