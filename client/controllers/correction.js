/**
 * Created by Johan on 2016-05-08.
 */
myApp.controller('correctionCtrl',
    [
        '$scope',
        'ExamManager',
        'SubmittedManager',
        'QuestionManager',
        'UserManager',
        'userService',
        function ($scope,
                  ExamManager,
                  SubmittedManager,
                  QuestionManager,
                  UserManager,
                  userService) {

            // FUNCTIONS

            /**
             * Init the correction by loading all needed data and setup scope variables.
             *
             * @param id
             */
            $scope.startCorrection = function (id) {
                $scope.currSubmitted = '';              // Current submitted exam.
                $scope.currExam = '';                   // Current exam
                $scope.questions = [];                  // All questions from exam
                $scope.questionsNeedCorrection = [];    // All question indexes thats not corrected
                $scope.currQuestion = '';               // Current question
                $scope.currSubAns = [];                 // Current user submitted answers
                $scope.currUser = '';                   // Student who submitted the exam
                $scope.qIndex = '';                     // Index of current question
                $scope.needIndex = '';                  // Index of need correction question
                $scope.currQPoints = [];                // Array with all viable points for a question

                SubmittedManager.getSubmitted(id, function (data) {
                    $scope.currSubmitted = data;
                    ExamManager.getExam($scope.currSubmitted.exam, function (data) {
                        $scope.currExam = data;
                        UserManager.getUser($scope.currSubmitted.student, function (data) {
                            $scope.currUser = data;
                            $scope.buildQuestions(function () {
                                $scope.qIndex = 0;
                                $scope.getQByIndex(0);
                            });
                        });
                    });
                });

            };

            /**
             * Gets all questions in the current exam.
             *
             * @param callback
             */
            $scope.buildQuestions = function (callback) {
                var waiting = $scope.currExam.questions.length;
                $scope.currExam.questions.forEach(function (currEQ) {
                    QuestionManager.getQuestion(currEQ, function (currQ) {
                        $scope.questions.push(currQ);
                        finish();
                    });
                });

                function finish() {
                    waiting--;
                    if (waiting === 0) {
                        $scope.findNeedCorrection(function () {
                            callback();
                        })
                    }
                }
            };

            /**
             * Finds all text-answers that isn't corrected and adds them to working array.
             *
             * @param callback
             */
            $scope.findNeedCorrection = function (callback) {
                for (var i = 0; i < $scope.currSubmitted.answers.length; i++) {
                    var subAns = $scope.currSubmitted.answers[i];
                    var question = $scope.questions[i];
                    if (question.type === 'text' && !subAns[0].corrected) {
                        $scope.questionsNeedCorrection.push(i)
                    }
                }
                callback();
            };

            // NAVIGATION

            /**
             * Step to next question
             */
            $scope.nextQuestion = function () {
                if (!$scope.onlyNeedCorrection) {
                    $scope.qIndex++;
                    $scope.getQByIndex($scope.qIndex);
                } else {
                    $scope.needIndex++;
                    var absIndex = $scope.questionsNeedCorrection[$scope.needIndex];
                    $scope.qIndex = absIndex;
                    $scope.getQByIndex(absIndex);
                }
            };

            /**
             * Step to previous question
             */
            $scope.previousQuestion = function () {
                if (!$scope.onlyNeedCorrection) {
                    $scope.qIndex--;
                    $scope.getQByIndex($scope.qIndex);
                } else {
                    $scope.needIndex--;
                    var absIndex = $scope.questionsNeedCorrection[$scope.needIndex];
                    $scope.qIndex = absIndex;
                    $scope.getQByIndex(absIndex);
                }
            };

            /**
             * Sets question by index from questions or questionsNeedCorrection
             *
             * @param index
             */
            $scope.getQByIndex = function (index) {
                $scope.currQuestion = $scope.questions[index];
                $scope.currSubAns = $scope.currSubmitted.answers[index];
                $scope.buildPoints();
                if ($scope.currQuestion.type === 'text') {
                    if (!$scope.currSubAns[0].points) {
                        $scope.currSubAns[0].points = 0;
                    }
                    if (!$scope.currSubAns[0].comment) {
                        $scope.currSubAns[0].comment = '';
                    }
                }
                if (!$scope.onlyNeedCorrection) {
                    if ($scope.qIndex < $scope.questions.length - 1) {
                        $scope.hasNextQ = true;
                    } else {
                        $scope.hasNextQ = false;
                    }

                    if ($scope.qIndex > 0) {
                        $scope.hasPreviousQ = true;
                    } else {
                        $scope.hasPreviousQ = false;
                    }
                } else {
                    if ($scope.needIndex < $scope.questionsNeedCorrection.length - 1) {
                        $scope.hasNextQ = true;
                    } else {
                        $scope.hasNextQ = false;
                    }

                    if ($scope.needIndex > 0) {
                        $scope.hasPreviousQ = true;
                    } else {
                        $scope.hasPreviousQ = false;
                    }
                }
            };

            /**
             * Toogles between only need correction and all questions
             */
            $scope.toggleNeedCorrection = function () {
                if ($scope.onlyNeedCorrection === true) {
                    console.log('onlyNeed är tydligen true'); // TEST
                    $scope.onlyNeedCorrection = false;
                    $scope.getQByIndex($scope.qIndex);
                } else {
                    console.log('onlyNeed är tydligen false'); // TEST
                    $scope.onlyNeedCorrection = true;
                    var currIndex = $scope.questionsNeedCorrection.indexOf($scope.qIndex);
                    if (currIndex > -1) {
                        $scope.needIndex = currIndex;
                        $scope.getQByIndex($scope.qIndex);
                    } else {
                        $scope.needIndex = 0;
                        var absIndex = $scope.questionsNeedCorrection[$scope.needIndex];
                        $scope.qIndex = absIndex;
                        $scope.getQByIndex(absIndex);
                    }
                }
            };

            /**
             * Returns total points awarded for multi, single and rank question
             *
             * @returns {number}
             */
            $scope.getPoints = function () {
                var points = 0;
                $scope.currSubAns.forEach(function (subAns) {
                    if (subAns.points) {
                        points += subAns.points;
                    }
                });
                return points;
            };

            /**
             * Builds points array
             */
            $scope.buildPoints = function () {
                $scope.currQPoints = [];
                for (var i = 0; i <= $scope.currQuestion.points;) {
                    $scope.currQPoints.push(i);
                    i += 0.5;
                }
            };

            /**
             * Changes corrected state of question
             */

            $scope.setCorrected = function() {
                var currStatus = $scope.currSubAns[0].corrected;
                $scope.currSubAns[0].corrected = !currStatus;
                if ($scope.currSubAns[0].corrected) {
                    var indexToRemove = $scope.questionsNeedCorrection.indexOf($scope.currQuestion._id);
                    if (indexToRemove > 0){
                        $scope.questionsNeedCorrection.splice(indexToRemove,1);
                    }
                } else {
                    $scope.questionsNeedCorrection.push($scope.currQuestion._id);
                }
            };

            // UPDATES

            /**
             * Saves and updates submitted exam
             */
            $scope.setCorrected = function () {
                $scope.currSubmitted[0].corrected = true;
                SubmittedManager.setSubmitted($scope.currSubmitted);
            };

            // INIT

            $scope.hasNextQ = false;                    // Do we have a another question?
            $scope.hasPreviousQ = false;                // Do we have a previous question?
            $scope.onlyNeedCorrection = false;          // Only display questions not corrected.
            $scope.needCorr = false;                    // Does the current question need correction?

            $scope.startCorrection(userService.testToCorrect);

        }]);