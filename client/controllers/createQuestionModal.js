/**
 * Created by Johan on 2016-04-29.
 */

myApp.controller('modalQuestionCtrl',
    [
        '$scope',
        'QuestionManager',
        'userService',
        'Upload',
        'APIBASEURL',
        '$uibModalInstance',
        function ($scope,
                  QuestionManager,
                  userService,
                  Upload,
                  APIBASEURL,
                  $uibModalInstance) {

            // FUNCTIONS

            // Form actions
            /**
             * Removes image from current question
             */
            $scope.removeImage = function () {
                $scope.questionImage = '';
            }

            /*
             $scope.checkboxChange = function (index) {
             if ($scope.question.type === 'single') {
             for (var i = 0; i < $scope.question.answerOptions.length; i++) {
             if (i !== index) {
             $scope.question.answerOptions[i].correct = false;
             }
             }
             }
             };
             */

            /**
             * Initializes a new question
             */
            $scope.newQuestion = function () {
                $scope.question = {
                    answerOptions: [],
                    points: 0,
                    vgQuestion: false
                };
                $scope.questionImage = '';
                $scope.okForm = true;
                $scope.pickType(0);
            };

            /**
             * Removes a answer option from current question
             *
             * @param index
             */
            $scope.removeAnswer = function (index) {
                $scope.question.answerOptions.splice(index, 1);
            };

            /**
             * Picks type of question
             *
             * @param index
             */
            $scope.pickType = function (index) {
                $scope.question.type = $scope.questionTypes[index].value;
                $scope.qTypeText = $scope.questionTypes[index].text;
            };

            /**
             * Adds a answer to current question
             */
            $scope.addAnswer = function () {
                $scope.question.answerOptions[$scope.question.answerOptions.length] = {
                    text: '',
                    correct: false
                };
            };

            /**
             * Toggles a answers corrected status
             *
             * @param index
             */
            $scope.toggleCorrect = function (index) {
                if ($scope.question.type === 'multi') {
                    var currVal = $scope.question.answerOptions[index].correct;
                    $scope.question.answerOptions[index].correct = !currVal;
                } else {
                    for (var i = 0; i < $scope.question.answerOptions.length; i++) {
                        if (i !== index) {
                            $scope.question.answerOptions[i].correct = false;
                        } else {
                            $scope.question.answerOptions[i].correct = !$scope.question.answerOptions[i].correct;
                        }
                    }
                    ;
                }
            };

            // MODAL FUNCTIONALITY

            /**
             * Persists and returns question to parent
             */
            $scope.ok = function () {
                $scope.submitQuestion(function () {
                    if ($scope.question._id) {
                        $uibModalInstance.close($scope.question);
                    } else {
                        console.log('Could not pass a new question to parent. Data: ' + JSON.stringify($scope.question));
                        $uibModalInstance.dismiss('Unable to send data');
                    }
                });
            };

            /**
             * Cancel question creation
             */
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };

            /**
             * Validates current question before posting to database with proper methods for questions containing images
             * or not.
             */
            $scope.submitQuestion = function (callback) {
                // Validate all required fields.
                $scope.okForm = true;
                $scope.validateError = '';

                // Check that a question title is present.
                if ($scope.question.title) {
                    if ($scope.question.title === '') {
                        $scope.validateError = 'En frågetext är nödvändig.';
                        $scope.okForm = false;
                    }
                } else {
                    $scope.okForm = false;
                }

                // Check that a question text is present.
                if ($scope.question.questionText) {
                    if ($scope.question.questionText === '') {
                        $scope.validateError = 'En frågetext är nödvändig.';
                        $scope.okForm = false;
                    }
                } else {
                    $scope.okForm = false;
                }

                // Check that the multi/single/rank-questions have answers.
                if ($scope.question.type !== 'text') {
                    if ($scope.question.answerOptions.length <= 0) {
                        $scope.validateError = 'Denna typ av fråga måste ha minst ett svarsalternativ.';
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
                                $scope.validateError = 'Ett riktigt svar måste anges.';
                            }
                            $scope.validateError = '';
                        }
                    }
                }

                // Add cre8or to question
                $scope.question.cre8or = userService.id;

                if ($scope.okForm) {
                    delete $scope.question.$$hashKey;

                    // Upload using multipart if image file is present.
                    if ($scope.questionImage && $scope.questionImage !== '') {
                        console.log('Trying to post new question with image. Data: ' + JSON.stringify($scope.question)); // TEST
                        var uploadForm = Upload.upload({
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
                            callback();
                        });


                    } else {
                        // Standard add question to database.
                        QuestionManager.addQuestion($scope.question, function (data) {
                            $scope.question = data;
                            callback();
                        });
                    }
                }
            };

            // INIT

            // The text representation of the question types
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


            $scope.newQuestion(); // Initializes new question at start
            $scope.pickType(0); // Picks default question type.

        }]);