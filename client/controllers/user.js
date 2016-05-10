/**
 * Created by Jonas on 2016-04-22.
 */

myApp.controller('userCtrl', ['$scope','UserManager', 'userService', function ($scope, UserManager, userService) {

    $scope.user = "";

    UserManager.getUser(userService.id, function(loggedInUser){
        $scope.user = loggedInUser;
    });
    
}]);


