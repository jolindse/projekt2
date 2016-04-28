/**
 * Created by Jonas on 2016-04-25.
 */

app.controller("loginCtrl", function($scope, $location, $rootScope) {
    $scope.login = function() {
        console.log("bajskorv");
        $rootScope.loggedInUser = $scope.username;
        $location.path("/student");
    };
});
