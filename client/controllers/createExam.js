/**
 * Created by robin on 2016-04-29.
 */
myApp.controller('makeExamCtrl', ['$scope', 'userService', 'ExamManager', 'QuestionManager', '$uibModal', function ($scope, userService, ExamManager, QuestionManager, $uibModal) {

    /*
     FUNCTIONS
     */
    $scope.newExam = function() {
        $scope.questionArray = [];

        $scope.exam = {
            gradePercentage: [],
            interval: [],
            questions: [],
        };
    };

    $scope.loadExam = function (id) {
        ExamManager.getExam(id, function (data) {
            $scope.exam = data;
            $scope.questionArray = [];
            data.questions.forEach(function (currQuestionId){
                QuestionManager.getQuestion(currQuestionId, function(data){
                   $scope.questionArray.push(data);
                });
            })
        });
    };

    $scope.deleteExam = function (){
        if ($scope.exam._id){
            ExamManager.deleteExam($scope.exam._id);
            $scope.newExam();
        }
    }

    $scope.saveExam = function () {
        var totalP = 0;
        $scope.exam.cre8or = userService.id;
        $scope.questionArray.forEach(function (currQ){
            totalP += currQ.points;
        });
        $scope.exam.maxPoints = totalP;
        ExamManager.addExam($scope.exam, function (data) {
            $scope.exam = data;
        });
    };

    $scope.updateExam = function () {
        var examUpdated = ExamManager.setExam($scope.exam);
        console.log('Försöker uppdatera. '+JSON.stringify(examUpdated)); // TEST
        $scope.loadExam(examUpdated._id);
    };

    $scope.addQuestion = function (currQuestion) {
        $scope.questionArray.push(currQuestion);
        $scope.exam.questions.push(currQuestion._id);
    };

    $scope.removeQuestion = function() {
        var newArray = [];
        $scope.questionArray.forEach(function (currQuestion){
            if (!currQuestion.selectedObject) {
                newArray.push(currQuestion);
            } else {
                var qIndex = $scope.exam.questions.indexOf(currQuestion._id);
                $scope.exam.questions.splice(qIndex,1);
            }
        });
        $scope.questionArray = newArray;
    };

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

    $scope.toggleObject = function(index) {
        var currStatus = $scope.questionArray[index].selectedObject;
        $scope.questionArray[index].selectedObject = !currStatus;
    };


    // MODAL

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
            data.forEach(function (currId){
               QuestionManager.getQuestion(currId, function(data){
                   $scope.addQuestion(data);
               })
            });
        });
    };

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
            data.forEach(function (currId){
                $scope.loadExam(currId)
            });
        });
    };

    /*
     INIT
     */

    $scope.newExam();

}]);