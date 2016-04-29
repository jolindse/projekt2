/**
 * Created by Jonas on 2016-04-27.
 */

/**
 * LOGIN-CONTROLLER
 */
myApp.controller("loginCtrl", ['$scope','$location','$rootScope','userService', function($scope, $location, $rootScope, userService) {
    $scope.errorMessage = "";
    $scope.username = "";
    $scope.password = "";
    var counter = 0;

    $scope.attemptLogin = function() {

        $.ajax({
            type: 'post',
            url: '/api/user/login/' + $scope.username,
            data: "password=" + $scope.password,
            dataType: "json",
            traditional: true,

            success: function (data) {
                if (data.login == true && data.user.admin == false){
                    sessionStorage.setItem('userId', data.user.id);
                    $location.path("/student");
                }
                else if (data.login == true && data.user.admin == true){
                    sessionStorage.setItem('userId', data.user.id);
                    $location.path("/admin");
                }
                else if (data.login == false){
                    console.log(data);
                }

                userService.login(data.user.firstName, data.user.id, data.user.admin, data.user.testToTake);

                if(!$scope.$$phase) {
                    //https://github.com/yearofmoo/AngularJS-Scope.SafeApply
                    $scope.$apply()
                }

            },
            error: function (errormessage) {
                if (errormessage.responseJSON.message == "Kontrollera användarnamn och lösenord"){
                    counter++;
                }
                console.log(counter);
                if (counter == 3){
                    $scope.loginError = false;
                    $scope.sendPasswordBtn = true;
                    counter = 0;
                }else {
                    $scope.errorMessage = errormessage.responseJSON.message;
                    $scope.loginError = true;
                }


                if(!$scope.$$phase) {
                    //https://github.com/yearofmoo/AngularJS-Scope.SafeApply
                    $scope.$apply();
                }
            }
        });
    };
}]);

/**
 * INDEX-CONTROLLER:
 */
myApp.controller('indexCtrl', function ($scope, $location, userService) {

    $scope.clickLogo = function() {
        if (userService.admin == true){
            $location.path("/admin");
        }
        else if (userService.admin == false){
            $location.path("/student");
        }
    };

    $scope.$on('updateNavbarBroadcast', function () {

        if (sessionStorage.getItem('userId') != null) {
            $scope.showLogout = true;

            if (userService.admin == true) {
                $scope.showAdminNav = true;
                $scope.showUserDetailsNav = true;
            }
            else if (userService.admin == false) {
                $scope.showStudentNav = true;
                $scope.showUserDetailsNav = true;
            }
        }
        else {
            $scope.showLogout = false;
            $scope.showAdminNav = false;
            $scope.showStudentNav = false;
            $scope.showUserDetailsNav = false;
        }
    });

    $scope.logout = function () {
        sessionStorage.clear();
        userService.updateNavbar();
    }

});

/**
 * STUDENT-CONTROLLER:
 */
myApp.controller('studentCtrl', function ($scope, userService) {
    $scope.name = userService.firstName;
    $scope.testAmount = userService.testsToTake.length;
    userService.updateNavbar();
});

/**
 * ADMIN-CONTROLLER:
 */
myApp.controller('adminCtrl', function ($scope, userService) {
    $scope.name = userService.firstName;
    userService.updateNavbar();
});

/**
 * USERDETAIL-CONTROLLER:
 */
myApp.controller('userDetailCtrl', function ($scope, userService) {
    $scope.firstName = userService.firstName;
    $scope.firstNameDisabled = true;

    $scope.changeFirstName = function () {
        $scope.firstNameDisabled = false;
    }

});
