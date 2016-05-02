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

                userService.login(data.user.firstName, data.user._id, data.user.admin, data.user.testToTake);

                if(!$scope.$$phase) {
                    //https://github.com/yearofmoo/AngularJS-Scope.SafeApply
                    $scope.$apply()
                }

            },
            error: function (errormessage) {
                if (errormessage.responseJSON.message == "Kontrollera användarnamn och lösenord"){
                    counter++;
                }
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
myApp.controller('studentCtrl', function ($scope, UserManager, ExamManager, userService) {
    userService.updateNavbar();

    $scope.user = "";

    UserManager.getUser(userService.id, function (data) {
        $scope.user = data;

        $scope.tests = [];
        $scope.user.testToTake.forEach(function(testId) {
            ExamManager.getExam(testId, function (test) {
                $scope.tests.push(test);
            });
        });
    });

    $scope.selectExam = function (data) {
        console.log(data);
    }
});

/**
 * ADMIN-CONTROLLER:
 */
myApp.controller('adminCtrl', function ($scope, StudentClassManager, UserManager, ExamManager, userService) {
    userService.updateNavbar();

    //User:
    $scope.user = "";

    //Testtable:
    $scope.tests = [];
    $scope.selectedTest = "";

    //Usertable:
    $scope.users = [];
    $scope.classes = [];
    $scope.sortType     = 'name';
    $scope.sortReverse  = false;
    $scope.searchUser   = '';

    UserManager.getUser(userService.id, function (data) {
        $scope.user = data;
    });

    UserManager.getAllUsers(function (data) {
        $scope.users = data;
    });

    StudentClassManager.getAllStudentClasses(function (data) {
       $scope.classes = data;
    });

    ExamManager.getAllExams(function (test) {
        $scope.tests = test;
    });

    $scope.selectExam = function (data) {
        console.log(data._id);
        ExamManager.getExam(data._id, function (data) {
            $scope.selectedTest = data;
        });
    };

    $scope.shareExam = function () {

    };

    $('#examTable').on('click', '.clickable-row', function() {
        if($(this).hasClass('active-row')){
            $(this).removeClass('active-row');
        } else {
            $(this).addClass('active-row').siblings().removeClass('active-row');
        }
    });


});

/**
 * USERDETAIL-CONTROLLER:
 */
myApp.controller('userDetailCtrl', function ($scope, $route, UserManager, userService) {
    $scope.user = "";

    $scope.firstNameDisabled = true;
    $scope.lastNameDisabled = true;
    $scope.passwordDisabled = true;
    $scope.emailDisabled = true;

    UserManager.getUser(userService.id, function (data) {
        $scope.user = data;
    });

    $scope.changeFirstName = function () {
        $scope.firstNameDisabled = false;
    };

    $scope.changeLastName = function () {
        $scope.lastNameDisabled = false;
    };

    $scope.changePassword = function () {
        $scope.passwordDisabled = false;
    };

    $scope.changeEmail = function () {
        $scope.emailDisabled = false;
    };

    $scope.updateUser = function () {
        UserManager.setUser($scope.user);
        $route.reload();
    };

});
