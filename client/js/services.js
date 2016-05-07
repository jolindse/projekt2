/**
 * Created by Jonas on 2016-04-27.
 */

myApp.factory('userService',['$rootScope', function($rootScope){
    var user = {};
    user.firstName = "";
    user.id = "";
    user.admin = "";
    user.testsToTake = [];
    user.currentExam = '572657c22e854865189929c6';

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