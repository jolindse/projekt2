/**
 * Created by Jonas on 2016-04-25.
 */

myApp.controller("loginCtrl", function($scope, $location, $rootScope) {

    $scope.logoutHide = true;



    $scope.attemptLogin = function() {

        $.ajax({
            type: 'post',
            url: '/api/user/login/' + $scope.username,
            data: "password=" + $scope.password,
            dataType: "json",
            traditional: true,

            success: function (data) {

                console.log(data);

                if (data.login == true && data.user.admin == false){
                    $rootScope.loggedInUser = $scope.username;
                    $location.path("/student");
                }
                else if (data.login == true && data.user.admin == true){
                    $rootScope.loggedInUser = $scope.username;
                    $location.path("/admin");
                }
                else if (data.login == false){
                    console.log(data);
                }


                if(!$scope.$$phase) {
                    //https://github.com/yearofmoo/AngularJS-Scope.SafeApply
                    $scope.$apply()
                }

            },
            error: function (errormessage) {

                console.log(errormessage.responseJSON.message);
                $scope.loginError = true;

                if(!$scope.$$phase) {
                    //https://github.com/yearofmoo/AngularJS-Scope.SafeApply
                    $scope.$apply();
                }

            }

        });



    };
});
