/**
 * Created by Johan on 2016-05-04.
 */
myApp.controller('modalListCtrl',
    [
        '$scope',
        'QuestionManager',
        'ExamManager',
        'SubmittedManager',
        'UserManager',
        'StudentClassManager',
        '$uibModalInstance',
        'listType',
        '$filter',
        function ($scope,
                  QuestionManager,
                  ExamManager,
                  SubmittedManager,
                  UserManager,
                  StudentClassManager,
                  $uibModalInstance,
                  listType,
                  $filter) {

            /**
             * FUNCTIONS
             */

            /**
             * Gets information for users list
             */
            $scope.loadUsers = function () {
                UserManager.getAllUsers(function (data) {
                    $scope.currentListObjects = data;
                    var numStudents = $scope.currentListObjects.length;
                    StudentClassManager.getAllStudentClasses(function (classesData) {
                        classesData.forEach(function (currClass) {
                            currClass.students.forEach(function (currStudentId) {
                                for (var i = 0; i < numStudents; i++) {
                                    if ($scope.currentListObjects[i]._id === currStudentId) {
                                        $scope.currentListObjects[i].studentClass = currClass.name;
                                        break;
                                    }
                                }
                            });
                        });
                    })
                });
            };

            /**
             * Gets information for classes list
             */
            $scope.loadClasses = function () {
                StudentClassManager.getAllStudentClasses(function (data) {
                    $scope.currentListObjects = data;
                });
            };

            /**
             * Gets information for question list
             */
            $scope.loadQuestions = function () {
                QuestionManager.getAllQuestions(function (data) {
                    $scope.currentListObjects = data;
                    $scope.currentListObjects.forEach(function (currQuestion) {
                        switch (currQuestion.type) {
                            case 'text':
                                currQuestion.typeName = 'Fritext';
                                break;
                            case 'multi':
                                currQuestion.typeName = 'Flerval';
                                break;
                            case 'single':
                                currQuestion.typeName = 'Enkelval';
                                break;
                            case 'rank':
                                currQuestion.typeName = 'Rangordning';
                                break;
                        }
                        if (currQuestion.cre8or) {
                            UserManager.getUser(currQuestion.cre8or, function (currCre8or) {
                                currQuestion.cre8orName = currCre8or.firstName + " " + currCre8or.surName;
                            });
                        } else {
                            currQuestion.cre8orName = "";
                        }
                    });
                });
            };

            /**
             * Gets information for exams list
             */
            $scope.loadExams = function () {
                ExamManager.getAllExams(function (data) {
                    $scope.currentListObjects = data;
                    $scope.currentListObjects.forEach(function (currExam) {
                        if (currExam.cre8or) {
                            UserManager.getUser(currExam.cre8or, function (currCre8or) {
                                currExam.cre8orName = currCre8or.firstName + " " + currCre8or.surName;
                            });
                        } else {
                            currExam.cre8orName = "";
                        }
                    })

                });

            };

            /**
             * Gets information for submitted exams list
             */
            $scope.loadSubmitted = function () {
                SubmittedManager.getAllSubmitted(function (data) {
                    $scope.currentListObjects = data;
                    $scope.currentListObjects.forEach(function (currSubmitted) {
                        UserManager.getUser(currSubmitted.student, function (currStudent) {
                            currSubmitted.studentName = currStudent.firstName + " " + currStudent.surName;
                            ExamManager.getExam(currSubmitted.exam, function (currExam) {
                                currSubmitted.examName = currExam.title;
                                currSubmitted.examPoints = currExam.maxPoints;
                                if (currExam.anonymous) {
                                    currSubmitted.studentName = 'Anonym';
                                }
                            })
                        })
                    })

                });

            };

            /**
             * Selects all items in list (based on filter)
             */
            $scope.selectAll = function () {
                var selectedArray = $filter('filter')($scope.currentListObjects, $scope.searchList);
                selectedArray.forEach(function (currSelected) {
                    if (!$scope.checkAll) {
                        currSelected.selectedObject = true;
                    } else {
                        currSelected.selectedObject = false;
                    }
                });
            };

            /**
             * Toggles selection of object based on if it's a multi or single selection list
             *
             * @param currObject
             */
            $scope.toggleObject = function (currObject) {
                if (listType.multi) {
                    var exIndex = $scope.selectedObjects.indexOf(currObject);
                    if (exIndex > -1) {
                        $scope.selectedObjects.splice(exIndex, 1);
                        currObject.selectedObject = false;
                    } else {
                        $scope.selectedObjects.push(currObject);
                        currObject.selectedObject = true;
                    }
                } else {
                    if ($scope.selectedObjects[0]) {
                        $scope.selectedObjects[0].selectedObject = false;
                        $scope.selectedObjects[0] = currObject;
                        $scope.selectedObjects[0].selectedObject = true;
                    } else {
                        $scope.selectedObjects[0] = currObject;
                        $scope.selectedObjects[0].selectedObject = true;
                    }

                }
            };

            /**
             * MODAL
             */

            /**
             * Returns the selected objects MongoDB id as array
             */
            $scope.ok = function () {
                if ($scope.selectedObjects) {
                    var returnArray = [];
                    $scope.selectedObjects.forEach(function (currObj) {
                        returnArray.push(currObj._id);
                    });
                    $uibModalInstance.close(returnArray);
                } else {
                    $uibModalInstance.dismiss('No objects');
                }
            };

            /**
             * Cancel modal
             */
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };

            /**
             * INIT
             */

            $scope.listType = listType;         // Reference the params object in scope
            $scope.selectedObjects = [];        // Initializes the selected list
            $scope.currentListObjects = [];     // Initializes the list objects array

            // Switch to determine what kind of list the modal is for.
            switch ($scope.listType.type) {
                case 'users':
                    $scope.loadUsers();
                    break;
                case 'classes':
                    $scope.loadClasses();
                    break;
                case 'questions':
                    $scope.loadQuestions();
                    break;
                case 'exams':
                    $scope.loadExams();
                    break;
                case 'submitted':
                    $scope.loadSubmitted();
                    break;
            }

        }]);