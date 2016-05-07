/**
 * Created by Johan on 2016-05-01.
 */
myApp.controller('doExamCtrl', ['$scope', 'userService', 'ExamManager', 'SubmittedManager', 'QuestionManager', 'APIBASEURL', function ($scope, userService, ExamManager, SubmittedManager, QuestionManager, APIBASEURL) {

    /*
     FUNCTIONS
     */

    /*
     Init exam and set up submit object.
     */

    $scope.startExam = function (id) {
        $scope.currSubmitted = {
            exam: id,
            student: userService.id,
            answers: []
        };
        $scope.questions = [];
        // Get current exam
        ExamManager.getExam(id, function (data) {
            $scope.currExam = data;
            $scope.buildQuestion(function () {
                $scope.currQuestion = $scope.questions[0];
                $scope.currAnswers = $scope.currSubmitted.answers[0];
            });
        });
    };

    $scope.buildQuestion = function (callback) {
        var waiting = $scope.currExam.questions.length;
        var i = 0;
        $scope.currExam.questions.forEach(function (currEQ) {
            QuestionManager.getQuestion(currEQ, function (currQ) {
                $scope.questions.push(currQ);
                if (currQ.type === 'rank') {
                    $scope.setupRanking(i);
                } else {
                    $scope.currSubmitted.answers[i] = ([{"text": ""}]);
                }
                i++;
                finish();
            });
        });

        function finish() {
            waiting--;
            if (waiting === 0) {
                callback();
            }
        }
    };

    /*
     Select and save answer to questions of multi and single type
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

    /*
    Check if string is in answerarray
     */
    $scope.inArray = function(currString) {
        var found = false;
        $scope.currSubmitted.answers[$scope.qIndex].forEach(function (currAns) {
            if (currAns.text === currString){
                found = true;
            }
        });
        return found;
    };


    /*
     Make sure rank-questions have all answers.
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

    /*
     Get next question
     */
    $scope.nextQuestion = function () {
        if ($scope.qIndex < $scope.currExam.questions.length) {
            $scope.qIndex++;
            $scope.currQuestion = $scope.questions[$scope.qIndex];
            $scope.currAnswers = $scope.currSubmitted.answers[$scope.qIndex];
        }
    };

    /*
     Get previous question
     */
    $scope.previousQuestion = function () {
        if ($scope.qIndex >= 0) {
            $scope.qIndex--;
            $scope.currQuestion = $scope.questions[$scope.qIndex];
            $scope.currAnswers = $scope.currSubmitted.answers[$scope.qIndex];
        }
    };

    $scope.submitExam = function () {
        SubmittedManager.addSubmitted($scope.currSubmitted, function(data){
           if (data._id) {
               console.log('Provet inlämnat');
           }
        });
    };

    /*
     INIT
     */
    $scope.qIndex = 0;
    $scope.hasNextQ = true;
    $scope.hasPreviousQ = false;

    $scope.currExam = '';
    $scope.currQuestion = '';
    $scope.currSubmitted = '';
    $scope.currAnswers = '';

    $scope.startExam(userService.currentExam);

}
]);