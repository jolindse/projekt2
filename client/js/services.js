/**
 * Created by Jonas on 2016-04-27.
 */

myApp.factory('userService',['$rootScope', function($rootScope){
    var user = {};
    user.firstName = "";
    user.id = "";
    user.admin = "";
    user.testsToTake = [];
    user.currentExam = "";
    user.startTime = "";
    user.testToCorrect = "573185f85984bf58018a1b74";

    user.login = function (firstName, id, admin, userTestsToTake){
        this.firstName = firstName;
        this.id = id;
        this.admin = admin;
        this.testsToTake = userTestsToTake;
        this.updateNavbar();
    };
    
    user.updateNavbar = function () {
        $rootScope.$broadcast('updateNavbarBroadcast');
    };

    return user;
}]);