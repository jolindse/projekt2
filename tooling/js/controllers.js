/**
 * Created by Johan on 2016-04-24.
 */

myApp.controller('homeCtrl', function ($scope) {

});

myApp.controller('classCtrl', function ($scope, $http) {
    /***********************************************************************************************************************
     /api/class                    GET    -            [class]            Gets ALL classes
     /api/class                POST    class        -                Adds a class
     /api/class/(id)            PUT        class        -                Updates a class
     /api/class/(id)            GET    -            class            Gets a specific class
     /api/class/(id)            DELETE    -            -                Deletes a class
     /api/class/remove/(id)        DELETE    -            -                Deletes a class and ALL students that belong to it

     class:
     {
     _id:				MongoDB id
     name:				String
     students:			[user._id,user._id...]
     }
     ***********************************************************************************************************************/

    $scope.class = {
        _id: "",
        name: "",
        students: []
    };


    $http.get('http://localhost:3000/api/class').success(function (classList) {
        $scope.listOfClasses;
    })

    $http.get('http://local')

});

myApp.controller('examCtrl', function ($scope) {

});

myApp.controller('questionCtrl', function ($scope) {

});

myApp.controller('submittedCtrl', function ($scope) {

});

myApp.controller('userCtrl', function ($scope) {

});
