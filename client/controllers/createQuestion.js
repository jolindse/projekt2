/**
 * Created by Johan on 2016-04-29.
 */

myApp.controller('makeQuestionCtrl', ['$scope', 'QuestionManager', 'userService', 'Upload', 'APIBASEURL', function ($scope, QuestionManager, userService, Upload, APIBASEURL) {

    // FUNCTIONS

    // Form actions
    $scope.removeImage = function () {
        $scope.questionImage = '';
    }

    $scope.checkboxChange = function (index) {
        if ($scope.question.type === 'single') {
            for (var i = 0; i < $scope.question.answerOptions.length; i++) {
                if (i !== index) {
                    $scope.question.answerOptions[i].correct = false;
                }
            }
        }
    };

    $scope.newQuestion = function () {
        $scope.question = {
            answerOptions: [],
            points: 0,
            vgQuestion: false
        };
        $scope.questionImage = "";
        $scope.qTypeText = "";
        $scope.okForm = true;
        $scope.selectedAnswer = {
            current: '',
            latest: ''
        };
        $scope.pickType(0);
    };

    $scope.removeAnswer = function () {
        console.log('Latest: ' + $scope.selectedAnswer.latest);
        $scope.question.answerOptions.splice($scope.selectedAnswer.latest, 1);
        console.log('Array after splice: ' + JSON.stringify($scope.question.answerOptions));
    };

    $scope.pickType = function (index) {
        $scope.question.type = $scope.questionTypes[index].value;
        $scope.qTypeText = $scope.questionTypes[index].text;
    };

    $scope.addAnswer = function () {
        $scope.question.answerOptions[$scope.question.answerOptions.length] = {
            text: '',
            correct: false
        };
    };

    // TO BE REDONE!
    $scope.setSelectedAnswer = function (currIndex) {
        if ($scope.selectedAnswer.current !== currIndex) {
            $scope.selectedAnswer.latest = $scope.selectedAnswer.current;
            $scope.selectedAnswer.current = currIndex;
        }
    };

    $scope.removeSelectedAnswer = function (currIndex) {
        if ($scope.selectedAnswer.current === currIndex) {
            $scope.selectedAnswer.latest = $scope.selectedAnswer.current;
            $scope.selectedAnswer.current = '';
        }
    }
    // END OF REDO

    $scope.submitQuestion = function () {
        // Validate all required fields.
        $scope.okForm = true;

        // Check that a question text is present.
        if ($scope.question.questionText) {
            if ($scope.question.questionText === '') {
                $scope.qTextError = 'En frågetext är nödvändig.';
                $scope.okForm = false;
            }
        } else {
            $scope.okForm = false;
        }
        $scope.qTextError = '';

        // Check that the multi/single/rank-questions have answers.
        if ($scope.question.type !== 'text') {
            if ($scope.question.answerOptions.length <= 0) {
                $scope.qAnswersError = 'Denna typ av fråga måste ha minst ett svarsalternativ.';
                $scope.okForm = false;
            } else {
                // Check that a correct answer has been appointed.
                if ($scope.question.type === 'multi' || $scope.question.type === 'single') {
                    var correctPresent = false;
                    $scope.question.answerOptions.forEach(function (currAnswer) {
                        if (currAnswer.correct === true) {
                            correctPresent = true;
                        }
                    });
                    if (!correctPresent) {
                        $scope.okForm = false;
                        $scope.qAnswersError = 'Ett riktigt svar måste anges.'
                    }
                    $scope.qAnswersError = '';
                }
            }
        }

        // Add cre8or to question
        $scope.question.cre8or = userService.id;


        if ($scope.okForm) {
            // Validation done. Clean object from empty values.
            for (var property in $scope.question) {
                if ($scope.question.hasOwnProperty(property)) {
                    if (property === "") {
                        if (property !== 'answerOptions')
                            delete $scope.question.property;
                    }
                }
            }

            // Upload using multipart if image file is present.
            if ($scope.questionImage !== '') {
                uploadForm = Upload.upload({
                    url: APIBASEURL + '/api/question',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    data: $scope.question,
                    file: $scope.questionImage,
                    arrayKey: ''
                });

                // Upload complete
                uploadForm.success(function (data, status, headers, config) {
                    $scope.question = data;
                    QuestionManager.setQuestion($scope.question);
                });
            } else {
                // Standard add question to database.
                QuestionManager.addQuestion($scope.question, function (data) {
                    $scope.question = data;
                });
            }
        }
    };

    // Standard actions

    $scope.loadQuestion = function (id) {
        QuestionManager.getQuestion(id, function (data) {
            $scope.question = data;
        });
    };

    $scope.loadAllQuestions = function () {
        QuestionManager.getAllQuestions(function (data) {
            $scope.questions = data;
        });
    };

    $scope.saveQuestion = function () {
        QuestionManager.setQuestion($scope.question);
    };

    // INIT

    $scope.questions = [];

    $scope.questionTypes = [
        {
            text: 'Fritext',
            value: 'text'
        },
        {
            text: 'Flerval',
            value: 'multi'
        },
        {
            text: 'Enkelval',
            value: 'single'
        },
        {
            text: 'Rangordning',
            value: 'rank'
        }];


    $scope.newQuestion();
    $scope.pickType(0);

}]);