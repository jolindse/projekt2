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
    user.submittedTest = "";
    user.startTime = "";

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

    user.editTest = function (testId) {
        $rootScope.$broadcast('editTestBroadcast', testId);
    };

    return user;
}]);