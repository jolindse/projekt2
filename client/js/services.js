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
    user.resultId = "";

    user.login = function (firstName, id, admin){
        this.firstName = firstName;
        this.id = id;
        this.admin = admin;
        this.updateNavbar();
    };
    
    user.updateNavbar = function (hideNavbar) {
        $rootScope.$broadcast('updateNavbarBroadcast', hideNavbar);
    };

    user.editTest = function (testId) {
        $rootScope.$broadcast('editTestBroadcast', testId);
    };

    user.setResults = function(submittedId) {
        user.resultId = submittedId;
    };

    return user;
}]);