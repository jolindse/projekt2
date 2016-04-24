/**
 * Created by Johan on 2016-04-24.
 */

uat.controller('homeCtrl', function ($scope) {

});

uat.controller('classCtrl', function ($scope, $http) {
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

uat.controller('examCtrl', function ($scope) {

});

uat.controller('questionCtrl', function ($scope) {

});

uat.controller('submittedCtrl', function ($scope) {

});

uat.controller('userCtrl', function ($scope) {

});
