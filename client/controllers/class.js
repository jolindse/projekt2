/**
 * Created by Jonas on 2016-04-25.
 */

myApp.controller('makeSchoolClassCtrl', ['$scope', 'userService', 'ClassManager', function($scope, userService, ClassManager){

    $scope.saveSchoolClass = function () {
        ClassManager.addClass($scope.class, function (data) {
            $scope.class = data;
            $scope.getAllClasses()
        })
    };

}]);
