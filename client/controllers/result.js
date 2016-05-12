/**
 * Created by Johan on 2016-05-11.
 */
myApp.controller('resultCtrl', [
    '$scope',
    'ExamManager',
    'QuestionManager',
    'SubmittedManager',
    'userService',
    function ($scope, ExamManager, QuestionManager, SubmittedManager, userService) {

        // FUNCTIONS

        /**
         * Loads all required data from database
         *
         * @param id
         */
        $scope.startResult = function (id) {
            $scope.currResult = "";     // Current result
            $scope.currExam = "";       // Current exam
            $scope.questions = [];      // Questions in exam

            SubmittedManager.getSubmitted(id, function (data) {
                $scope.currResult = data;
                ExamManager.getExam($scope.currResult.exam, function (data) {
                    $scope.currExam = data;
                    if ($scope.currExam.feedback) {
                        $scope.buildQuestions(function () {
                            $scope.buildResults();
                        });
                    }
                });
            });
        };

        /**
         * Builds question array in proper order
         *
         * @param callback
         */
        $scope.buildQuestions = function (callback) {
            var counter = $scope.currExam.questions.length;
            $scope.currExam.questions.forEach(function (currQid) {
                QuestionManager.getQuestion(currQid, function (currQ) {
                    var qIndex = $scope.currExam.questions.indexOf(currQ._id);
                    finish(currQ, qIndex);
                });
            });

            function finish(question, index) {
                $scope.questions[index] = question;
                counter--;
                if (counter === 0) {
                    callback();
                }
            }
        };

        /**
         * Builds an array with concatenated results for display
         *
         */
        $scope.buildResults = function () {
            $scope.resultsArray = [];

            for (var i = 0; i < $scope.questions.length; i++) {
                var currObj = {
                    qIndex: i + 1
                };
                // Values from objects
                currObj.maxPoints = $scope.questions[i].points;
                currObj.type = $scope.questions[i].type;
                currObj.title = $scope.questions[i].title;
                currObj.text = $scope.questions[i].questionText;

                // Points
                var currAns = $scope.currResult.answers[i];
                var pointsTot = 0;
                currAns.forEach(function (ansObj){
                    pointsTot += ansObj.points;
                });

                if (pointsTot > 0) {
                    currObj.correct = true;
                    currObj.points = pointsTot;
                } else {
                    currObj.correct = false;
                    currObj.points = 0;
                }
                // Add to resultsArray
                $scope.resultsArray[i] = currObj;
            }
        };

        // INIT

        var resultId = userService.resultId;
        if (resultId) {
            $scope.startResult(resultId);
            userService.setResults("");
        }

    }]);