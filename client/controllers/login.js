/**
 * Created by Jonas on 2016-04-25.
 */

app.controller("loginCtrl", function($scope, $location, $rootScope) {
    $scope.login = function() {
        $rootScope.loggedInUser = $scope.username;
        $location.path("/student");
    };
});
