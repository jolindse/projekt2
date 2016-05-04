/**
 * Created by Johan on 2016-05-04.
 */
myApp.controller('modalListCtrl', ['$scope', 'QuestionManager', 'ExamManager', 'SubmittedManager', 'UserManager', 'StudentClassManager', '$uibModalInstance', 'listType', function ($scope, QuestionManager, ExamManager, SubmittedManager, UserManager, StudentClassManager, $uibModalInstance, listType) {

    /**
     * FUNCTIONS
     */


    $scope.loadUsers = function () {
        UserManager.getAllUsers(function (data) {
            console.log('Students gotten'); // TEST
            $scope.currentListObjects = data;
            StudentClassManager.getAllStudentClasses(function (classdata) {
                console.log('Classes gotten'); // TEST
                classdata.forEach(function (currClass) {
                    console.log('CurrClass: ' + JSON.stringify(currClass)); // TEST
                    currClass.students.forEach(function (currStudent) {
                        console.log('CurrStudentID: ' + currStudent); // TEST
                        var numStudents = $scope.currentListObjects.length;
                        for (var i = 0; i < numStudents; i++) {
                            if ($scope.currentListObjects[i]._id === currStudent) {
                                $scope.currentListObjects[i].studentClass = currStudent.name;
                                console.log(JSON.stringify(currentListObjects) + JSON.stringify(currStudent));
                                break;
                            }
                        }
                    });
                });
            })
        });
    };

    $scope.loadQuestions = function () {
        QuestionManager.getAllQuestions(function (data) {
            $scope.currentListObjects = data;
        });
    };

    $scope.loadExam = function () {
        QuestionManager.getAllQuestions(function (data) {
            $scope.currentListObjects = data;
        });

    };

    $scope.loadSubmitted = function () {
        SubmittedManager.getAllSubmitted(function (data) {
            $scope.currentListObjects = data;
        });

    };

    /*
     case 'questions':
     QuestionManager.getAllQuestions(function (data) {
     $scope.currentListObjects = data;
     break;
     });
     case 'exams':
     ExamManager.getAllExams(function (data) {
     $scope.currentListObjects = data;
     break;
     });
     case 'submitted':
     SubmittedManager.getAllSubmitted(function (data) {
     $scope.currentListObjects = data;
     break;
     });
     }
     };
     */

    $scope.addObject = function (index) {
        $scope.selectedObjects.push($scope.currentListObjects[index]);
    };

    $scope.removeObject = function (index) {
        var objIndex = $scope.selectedObjects.indexOf($scope.currentListObjects[index]);
        $scope.selectedObjects(objIndex)
    };

    /**
     * MODAL
     */

    $scope.ok = function () {
        if ($scope.selectedObjects) {
            $scope.selectedObjects.forEach(function (currObj) {
                if (currObj.studentClass) {
                    delete currObj.studentClass;
                }
            });
            $uibModalInstance.close($scope.selectedObjects);
        } else {
            $uibModalInstance.dismiss('No objects');
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };

    /**
     * INIT
     */

    $scope.selectedObjects = [];
    $scope.currentListObjects = [];

    $scope.loadUsers();


}])
;