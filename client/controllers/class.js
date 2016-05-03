/**
 * Created by Jonas on 2016-04-25.
 */

myApp.controller('classCtrl', function($scope, userService, StudentClassManager){
    
    $scope.saveSchoolClass = function () {
        StudentClassManager.addStudentClass($scope.class, function (data) {
            $scope.class = data;
        })
    };
    
    $('#newStudentModal').click(function () {
        $('#createStudentModal').show();
    });
    $('.close').click(function () {
        $('.modal').hide();
    });
    $('#sparaStudent').click(function () {
        $('#createStudentModal').hide();
    });
    $('#newClassModal').click(function () {
       $('#createClassModal').show();
    });
    $('#saveSchoolClass').click(function () {
        $('#createClassModal').hide();
    });
    
});

