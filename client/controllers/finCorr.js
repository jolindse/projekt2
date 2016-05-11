myApp.controller('finishedCorrCtrl',['$scope','$location','$timeout', function ($scope,$location,$timeout) {

    $timeout(function(){
        console.log('Timeout started'); // TEST
        $location.path('/admin');
    },5000);

    $scope.gotoIndex = function() {
        $location.path('/admin');
    };

}]);