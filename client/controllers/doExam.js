/**
 * Created by Johan on 2016-05-01.
 */
myApp.controller('doExamCtrl',
    [
        '$scope',
        'userService',
        'ExamManager',
        'SubmittedManager',
        'QuestionManager',
        'APIBASEURL',
        '$http',
        function ($scope,
                  userService,
                  ExamManager,
                  SubmittedManager,
                  QuestionManager,
                  APIBASEURL,
                  $http) {

            /*
             FUNCTIONS
             */

            /**
             * Initializes the exam and submit object
             *
             * @param id
             */
            $scope.startExam = function (id) {
                $scope.currSubmitted = {
                    exam: id,
                    student: userService.id,
                    answers: []
                };
                $scope.currSubmitted.startTime = moment().format('YYYY-MM-DD HH:mm');
                $scope.questions = [];
                // Get current exam
                ExamManager.getExam(id, function (data) {
                    $scope.currExam = data;
                    $scope.buildQuestion(function () {
                        $scope.currQuestion = $scope.questions[0];
                        $scope.currAnswers = $scope.currSubmitted.answers[0];
                        $scope.$broadcast('timer-set-countdown', $scope.currExam.time * 60);
                    });
                });
            };

            /**
             * Gets all questions in exam
             *
             * @param callback
             */
            $scope.buildQuestion = function (callback) {
                var waiting = $scope.currExam.questions.length;
                var i = 0;
                $scope.currExam.questions.forEach(function (currEQ) {
                    QuestionManager.getQuestion(currEQ, function (currQ) {
                        //$scope.questions.push(currQ);
                        var index = $scope.currExam.questions.indexOf(currQ._id);
                        finish(currQ, index);
                    });
                });

                function finish(question, index) {
                    waiting--;
                    $scope.questions[index] = question;
                    if ($scope.questions[index].type === 'rank') {
                        console.log('Rank question index: '+index); // TEST
                        $scope.setupRanking(index);
                    } else {
                        $scope.currSubmitted.answers[index] = ([{"text": ""}]);
                    }
                    console.log('Added question: '+JSON.stringify($scope.questions[index],null,2)); // TEST
                    if (waiting === 0) {
                        callback();
                    }
                }
            };

            /**
             * Selects and saves answers to multi and single type questions
             *
             * @param index
             */
            $scope.selectAnswer = function (index) {
                var currAns = $scope.currSubmitted.answers[$scope.qIndex];
                if ($scope.currQuestion.type === 'single') {
                    currAns[0].text = $scope.currQuestion.answerOptions[index].text;
                }
                if ($scope.currQuestion.type === 'multi') {
                    var currIndex = -1;
                    for (var aindex = 0; aindex < currAns.length; aindex++) {
                        if (currAns[aindex].text == $scope.currQuestion.answerOptions[index].text) {
                            currIndex = aindex;
                        }
                    }
                    if (currIndex >= 0) {
                        currAns.splice(currIndex, 1);
                        if (currAns.length < 1) {
                            currAns[0] = ({"text": ""});
                        }
                    } else {
                        if (currAns[0].text === "") {
                            currAns[0] = {text: $scope.currQuestion.answerOptions[index].text};
                        } else {
                            currAns.push({text: $scope.currQuestion.answerOptions[index].text});
                        }
                    }
                }
            };

            /**
             * Checks if a string is in array of answers
             *
             * @param currString
             * @returns {boolean}
             */
            $scope.inArray = function (currString) {
                var found = false;
                $scope.currSubmitted.answers[$scope.qIndex].forEach(function (currAns) {
                    if (currAns.text === currString) {
                        found = true;
                    }
                });
                return found;
            };

            /**
             * Builds the ranking answers and randomizes them for display
             *
             * @param index
             */
            $scope.setupRanking = function (index) {
                // Build answer strings
                $scope.currSubmitted.answers[index] = [];
                $scope.questions[index].answerOptions.forEach(function (data) {
                    $scope.currSubmitted.answers[index].push({"text": data.text});
                });
                // Randomize the order of the answers.
                var origArray = $scope.currSubmitted.answers[index].slice(0);
                for (var i = $scope.currSubmitted.answers[index].length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = origArray[i];
                    origArray[i] = origArray[j];
                    origArray[j] = temp;
                }
                $scope.currSubmitted.answers[index] = origArray;
            };

            /**
             * Gets the next question
             */
            $scope.nextQuestion = function () {
                if ($scope.qIndex < $scope.currExam.questions.length) {
                    $scope.qIndex++;
                    $scope.currQuestion = $scope.questions[$scope.qIndex];
                    $scope.currAnswers = $scope.currSubmitted.answers[$scope.qIndex];
                }
            };

            /**
             * Gets the previous question
             */
            $scope.previousQuestion = function () {
                if ($scope.qIndex >= 0) {
                    $scope.qIndex--;
                    $scope.currQuestion = $scope.questions[$scope.qIndex];
                    $scope.currAnswers = $scope.currSubmitted.answers[$scope.qIndex];
                }
            };

            /**
             * Submits the exam, either manually by user och triggered by timer.
             */
            $scope.submitExam = function () {
                SubmittedManager.addSubmitted($scope.currSubmitted, function (data) {
                    console.log(JSON.stringify(data, null, 2));
                });
            };

            /*
             INIT
             */

            $scope.qIndex = 0;                  // Index of what question is currently displayed
            $scope.hasNextQ = true;             // True if there is another question after the current
            $scope.hasPreviousQ = false;        // True if there is a previous question before the current

            $scope.currExam = '';
            $scope.currQuestion = '';
            $scope.currSubmitted = '';
            $scope.currAnswers = '';

            $scope.startExam(userService.currentExam);

        }
    ]);