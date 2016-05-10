/**
 * Created by robin on 2016-04-29.
 */
myApp.controller('makeExamCtrl',
    [
        '$scope',
        'userService',
        'ExamManager',
        'QuestionManager',
        '$uibModal',
        function ($scope,
                  userService,
                  ExamManager,
                  QuestionManager,
                  $uibModal) {

            /*
             FUNCTIONS
             */

            /**
             * Initializes a new exam
             */
            $scope.newExam = function () {
                $scope.questionArray = [];

                $scope.exam = {
                    gradePercentage: [],
                    interval: [],
                    questions: [],
                };
            };

            /**
             * Loads an exam
             *
             * @param id
             */
            $scope.loadExam = function (id) {
                ExamManager.getExam(id, function (data) {
                    $scope.exam = data;
                    $scope.questionArray = [];
                    data.questions.forEach(function (currQuestionId) {
                        QuestionManager.getQuestion(currQuestionId, function (data) {
                            $scope.questionArray.push(data);
                        });
                    })
                });
            };

            /**
             * Deletes the current exam
             */
            $scope.deleteExam = function () {
                if ($scope.exam._id) {
                    ExamManager.deleteExam($scope.exam._id);
                    $scope.newExam();
                }
            }

            /**
             * Saves the current exam
             */
            $scope.saveExam = function () {
                var totalP = 0;
                $scope.exam.cre8or = userService.id;
                $scope.questionArray.forEach(function (currQ) {
                    totalP += currQ.points;
                });
                $scope.exam.maxPoints = totalP;
                ExamManager.addExam($scope.exam, function (data) {
                    $scope.exam = data;
                });
            };

            /**
             * Updates the previously saved exam in database
             */
            $scope.updateExam = function () {
                var examUpdated = ExamManager.setExam($scope.exam);
                $scope.loadExam(examUpdated._id);
            };

            /**
             * Adds a question to the current exam
             *
             * @param currQuestion
             */
            $scope.addQuestion = function (currQuestion) {
                $scope.questionArray.push(currQuestion);
                $scope.exam.questions.push(currQuestion._id);
            };

            /**
             * Removes a question from the current exam
             */
            $scope.removeQuestion = function () {
                var newArray = [];
                $scope.questionArray.forEach(function (currQuestion) {
                    if (!currQuestion.selectedObject) {
                        newArray.push(currQuestion);
                    } else {
                        var qIndex = $scope.exam.questions.indexOf(currQuestion._id);
                        $scope.exam.questions.splice(qIndex, 1);
                    }
                });
                $scope.questionArray = newArray;
            };

            /**
             * Sets the parameters for the datetimepicker
             *
             * @type {{icons: {next: string, previous: string, up: string, down: string}, format: string, stepping: number, sideBySide: boolean, calendarWeeks: boolean}}
             */
            $scope.dateParams = {
                icons: {
                    next: 'glyphicon glyphicon-right',
                    previous: 'glyphicon glyphicon-arrow-left',
                    up: 'glyphicon glyphicon-arrow-up',
                    down: 'glyphicon glyphicon-arrow-down'
                },
                format: 'YYYY-MM-DD HH:mm',
                stepping: 10,
                sideBySide: true,
                calendarWeeks: true
            };

            /**
             * Toggles the selection status of a question
             *
             * @param index
             */
            $scope.toggleObject = function (index) {
                var currStatus = $scope.questionArray[index].selectedObject;
                $scope.questionArray[index].selectedObject = !currStatus;
            };


            // MODAL

            /**
             * Initializes new question modal
             */
            $scope.newQuestion = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'modalviews/newquestion.html',
                    controller: 'modalQuestionCtrl',
                    size: 'lg'
                });

                modalInstance.result.then(function (data) {
                    $scope.addQuestion(data);
                });
            };

            /**
             * Initializes a pick question modal
             */
            $scope.pickQuestions = function () {
                var listModal = $uibModal.open({
                    animation: true,
                    templateUrl: 'modalviews/listModal.html',
                    controller: 'modalListCtrl',
                    size: 'lg',
                    resolve: {
                        listType: {
                            type: 'questions',
                            multi: true
                        }
                    }
                });

                listModal.result.then(function (data) {
                    data.forEach(function (currId) {
                        QuestionManager.getQuestion(currId, function (data) {
                            $scope.addQuestion(data);
                        })
                    });
                });
            };

            /**
             * Initializes a pick exam modal
             */
            $scope.pickExam = function () {
                var listModal = $uibModal.open({
                    animation: true,
                    templateUrl: 'modalviews/listModal.html',
                    controller: 'modalListCtrl',
                    size: 'lg',
                    resolve: {
                        listType: {
                            type: 'exams',
                            multi: false
                        }
                    }
                });

                listModal.result.then(function (data) {
                    data.forEach(function (currId) {
                        $scope.loadExam(currId)
                    });
                });
            };

            /*
             INIT
             */

            $scope.newExam();

            /**
             * Loads an exam to edit on broadcast:
             */

            $scope.$on('editTestBroadcast', function (event, testId) {
                console.log("createExam, id = " + testId);
                $scope.loadExam(testId);
            });

        }]);