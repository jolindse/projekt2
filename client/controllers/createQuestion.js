/**
 * Created by Johan on 2016-04-29.
 */

myApp.controller('makeQuestionCtrl',
    [
        '$scope',
        'QuestionManager',
        'userService',
        'Upload',
        'APIBASEURL',
        '$uibModal',
        function ($scope,
                  QuestionManager,
                  userService,
                  Upload,
                  APIBASEURL,
                  $uibModal) {

            // FUNCTIONS

            // Form actions

            /**
             * Removes image from current question
             */
            $scope.removeImage = function () {
                $scope.questionImage = '';
            }

            /**
             * Checks or unchecks correct status of answer
             *
             * @param index
             */
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

            /**
             * Validates current question before posting to database with proper methods for questions containing images
             * or not.
             */
            $scope.submitQuestion = function () {
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
                        if (!$scope.question._id) {
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
                            uploadForm = Upload.upload({
                                url: APIBASEURL + '/api/question',
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                },
                                data: $scope.question,
                                file: $scope.questionImage,
                                arrayKey: ''
                            });

                            // Upload complete
                            uploadForm.success(function (data, status, headers, config) {
                                QuestionManager.setQuestion($scope.question);
                            });
                        }
                    } else {
                        // Update or save
                        if ($scope.question._id) {
                            var updatedQ = QuestionManager.setQuestion($scope.question);
                            $scope.question = updatedQ;
                        } else {
                            // Standard add question to database.
                            QuestionManager.addQuestion($scope.question, function (data) {
                                $scope.question = data;
                            });
                        }
                    }
                }
            };

            // Standard actions

            /**
             * Loads a question
             *
             * @param id
             */
            $scope.loadQuestion = function (id) {
                QuestionManager.getQuestion(id, function (data) {
                    $scope.question = data;
                    if ($scope.question.imageUrl.length > 0) {
                        $scope.questionImage = APIBASEURL+'/'+$scope.question.imageUrl;
                    }
                });
            };

            /**
             * Deletes current question
             */
            $scope.delQuestion = function () {
                if (!$scope.question._id) {
                    $scope.newQuestion();
                } else {
                    QuestionManager.deleteQuestion($scope.question._id);
                    $scope.newQuestion();
                }
            };

            // Modal

            /**
             * Initializes question picking modal
             */
            $scope.pickQuestion = function () {
                var listModal = $uibModal.open({
                    animation: true,
                    templateUrl: 'modalviews/listModal.html',
                    controller: 'modalListCtrl',
                    size: 'lg',
                    resolve: {
                        listType: {
                            type: 'questions',
                            multi: false
                        }
                    }
                });

                listModal.result.then(function (data) {
                    data.forEach(function (currId) {
                        $scope.loadQuestion(currId);
                    });
                });
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

        }
    ]);