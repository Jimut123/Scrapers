/**
 * Created by Ideation on 24-01-2017.
 */
angular.module('controlPanelApp').controller('UserController', UserController);

function UserController(MembershipUserService, MembershipUserRoleService, $uibModal, $scope, MembershipService) {
    var self = this;
    self.membershipusersDisplay = [];
    self.pageSize=15;
    self.currentPage = 0;
    self.dataLoaded = false;

    /*fetch all users*/
    //MembershipUserService.get().$promise.then(
    //    function (membershipUserListResponse) {
    //        console.log('membershipUserListResponse', membershipUserListResponse.data);
    //        self.membershipusers = membershipUserListResponse.data.userList;
    //        self.dataLoaded = true;
    //    },
    //    function (error) {
    //        console.log(error);
    //    }
    //);

    /*fetch all users*/
    MembershipService.getAllUsers().then(function (response) {
        self.membershipusers = response.data.userList;
        self.dataLoaded = true;
    }, function (err) {
        console.log(err);
    });

    ///*fetch all user roles proactively for use in add/edit user modal*/
    //MembershipUserRoleService.get().$promise.then(
    //    function (membershipGroupListResponse) {
    //        self.membershipUserRoles = membershipGroupListResponse.data;
    //    },
    //    function (error) {
    //        console.log(error);
    //    }
    //);

    /*fetch all user roles proactively for use in add/edit user modal*/
    MembershipService.getAllRoles().then(function (response) {
        self.membershipUserRoles = response.data.groupList;
    }, function (err) {
        console.log(err);
    });

    /*set values to differentiate between add user and edit user operations*/
    self.setClickSource = function (type, index) {
        self.modalTitle = type + ' User';
        if (type === 'Add') {
            self.selectedUser = {"membershipGroups": []};
            self.operationIsAdd = true;
        } else if (type === 'Edit') {
	    self.selectedUser = $scope.filteredCollection[(self.pageSize*self.currentPage)+index];
            self.operationIsAdd = false;
        }

        /*resetting the checkboxes*/
        for (var j = 0; j < self.membershipUserRoles.length; j++) {
            self.membershipUserRoles[j].selected = false;

        }

        /*selecting the user roles for the selected User*/
        if (!self.operationIsAdd) {

            for (var i = 0; i < self.selectedUser.membershipGroups.length; i++) {
                var groupId = self.selectedUser.membershipGroups[i].groupId;
                for (var k = 0; k < self.membershipUserRoles.length; k++) {
                    if (groupId === self.membershipUserRoles[k].groupId) {
                        self.membershipUserRoles[k].selected = true;
                    }
                }
            }
        }
        $uibModal.open({
            templateUrl: 'userDetailsModal.html',
            controller: 'UserDetailsModalController',
            controllerAs: 'UDMCtrl',
            resolve: {
                parent: function () {
                    return self;
                }
            }
        });
    };

    self.showDeleteUserConfirmation = function (index) {
        self.userIndexTobeDeleted = (self.pageSize*self.currentPage)+index;
    }

    self.deleteUser = function (index) {
        MembershipUserService.remove({id: $scope.filteredCollection[index].userId}).$promise.then(
            function (success) {
                self.membershipusers.splice(index, 1);
                console.log(success);
            }, function (error) {
                console.log(error);
            })

    }
    
	self.rembemberCurrentPage= function(newPage){
		self.currentPage=newPage-1;
		console.log(self.currentPage);
	}

	self.saveUser = function () {
        /*setting the roles to the user*/
        self.selectedUser.membershipGroups.length = 0;
        for (var j = 0; j < self.membershipUserRoles.length; j++) {
            if (self.membershipUserRoles[j].selected === true) {
                self.selectedUser.membershipGroups.push({"groupId": self.membershipUserRoles[j].groupId});
            }
        }

        if (self.operationIsAdd) {
            MembershipUserService.save({}, self.selectedUser).$promise.then(
                function (simpleMembershipUser) {
                    self.membershipusers.push(simpleMembershipUser);
                    console.log('added');
                    console.log(simpleMembershipUser);
                }, function (error) {
                    console.log(error);
                }
            )
        } else {
            MembershipUserService.update({id: self.selectedUser.userId}, self.selectedUser).$promise.then(
                function (simpleMembershipUser) {
                    console.log('updated');
                    console.log(simpleMembershipUser);
                }, function (error) {
                    console.log(error);
                }
            )
        }
	}

  
};

angular.module('controlPanelApp').controller('UserDetailsModalController', function (parent, $uibModalInstance) {
   this.parent = parent;

   console.log("Kaushik");

    this.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    this.save = function () {
        parent.saveUser();
        $uibModalInstance.dismiss('cancel');
    };

  
});

