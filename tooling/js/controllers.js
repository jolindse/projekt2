/**
 * Created by Johan on 2016-04-24.
 */

/***********************************************************************************************************************
 *
 **********************************************************************************************************************/



uat.controller('homeCtrl', function ($scope) {

});

/***********************************************************************************************************************
 * CLASS
 **********************************************************************************************************************/

uat.controller('classCtrl', ['$scope', 'StudentClassManager', function ($scope, StudentClassManager) {

    $scope.studentClasses = [];
    $scope.studentClass = '';
    $scope.studentToAdd = '';
    $scope.deleteId = "";
    $scope.fullDelete = false;


    // Load a class
    $scope.loadClass = function () {
        StudentClassManager.getStudentClass($scope.studentClass._id, function (data) {
            $scope.studentClass = data;
        });
    };

    // Load all classes
    $scope.getAllClasses = function () {
        StudentClassManager.getAllStudentClasses(function (data) {
            $scope.studentClasses = data;
        });
    };

    // Add students to class
    $scope.addStudent = function () {
        $scope.studentClass.students.push($scope.studentToAdd);
    };

    // Update and add
    $scope.submitClass = function () {
        for (var property in $scope.studentClass) {
            if ($scope.studentClass.hasOwnProperty(property)) {
                if (property === ""){
                    delete $scope.studentClass.property;
                }
            }
        }
        
        if ($scope.studentClass._id) {
            StudentClassManager.setStudentClass($scope.studentClass);
        } else {
            delete $scope.studentClass._id; // Need to remove this in order for MongoDB integrity.
            StudentClassManager.addStudentClass($scope.studentClass, function (newClass) {
                $scope.studentClass = newClass;
            });

        }
    };

    // Delete a class
    $scope.deleteClass = function () {
        if ($scope.fullDelete) {
            StudentClassManager.deleteClassFull($scope.deleteId);
        } else {
            StudentClassManager.deleteClass($scope.deleteId);
        }
    };

    $scope.getAllClasses();
}]);


/***********************************************************************************************************************
 * EXAM
 **********************************************************************************************************************/

uat.controller('examCtrl', ['$scope', 'ExamManager', function ($scope, ExamManager) {
    $scope.exam = '';
    $scope.questionToAdd = '';
    $scope.exams = [];
    $scope.examByAuthor = [];
    $scope.deleteId = "";
    $scope.interval1 = "";
    $scope.interval2 = "";
    $scope.gradePercentageG = "";
    $scope.gradePercentageVG = "";

    // Load a exam
    $scope.loadExam = function () {
        ExamManager.getExam($scope.exam._id, function (currExam) {
            $scope.exam = currExam;
        });
    };

    // Add question to exam
    $scope.addQuestion = function () {
        $scope.exam.questions.push($scope.questionToAdd);
    };

    $scope.fillArrays = function () {
        if ($scope.interval1 !== "" && $scope.interval2 !== "") {
            $scope.exam.interval = [];
            $scope.exam.interval.push($scope.interval1);
            $scope.exam.interval.push($scope.interval2);
        }
        if ($scope.gradePercentageG !== "" && $scope.gradePercentageVG !== "") {
            $scope.exam.gradePercentage = [];
            $scope.exam.gradePercentage.push($scope.gradePercentageG);
            $scope.exam.gradePercentage.push($scope.gradePercentageVG);
        }
    }

    // Show all exams
    $scope.getAllExams = function () {
        ExamManager.getAllExams(function (data) {
            $scope.exams = data;
        });
    };

    // Update and add
    $scope.submitExam = function () {
        $scope.fillArrays();
        // Make sure no zero value properties of object gets posted.
        for (var property in $scope.exam) {
            if ($scope.exam.hasOwnProperty(property)) {
                if (property === ""){
                    delete $scope.exam.property;
                }
            }
        }

        if ($scope.exam._id) {
            ExamManager.setExam($scope.exam);
        } else {
            delete $scope.exam._id; // Need to remove this in order for MongoDB integrity.
            ExamManager.addExam($scope.exam, function (newExam) {
                $scope.exam = newExam;
            });
        }
        $scope.getAllExams();
    };

    // Delete a exam
    $scope.deleteExam = function () {
      ExamManager.deleteExam($scope.deleteId);
    };

    // Get exams by author
    $scope.getByAuthor = function () {
        ExamManager.getExamBy($scope.exam.cr8or, function(data){
           $scope.examByAuthor = data;
        });
    };

    $scope.getAllExams();
}]);

/***********************************************************************************************************************
 * QUESTION
 **********************************************************************************************************************/

uat.controller('questionCtrl',['$scope','QuestionManager', function ($scope, QuestionManager) {
    $scope.question = {
        answerOptions: []
    };
    $scope.answerToAdd = {};
    $scope.questions = [];
    $scope.questionByAuthor = [];
    $scope.deleteId = "";

    // Load a question
    $scope.loadQuestion = function () {
        QuestionManager.getQuestion($scope.question._id, function (currQuestion) {
            $scope.question = currQuestion;
        });
    };

    // Add question to question
    $scope.addAnswer = function () {
        var answerObject = function(textQ, correctQ) {
            this.text = textQ;
            if (!correctQ) {
                this.correct = false;
            } else {
                this.correct = correctQ;
            }
        }

        var currAnswer = new answerObject($scope.answerToAdd.text, $scope.answerToAdd.correct);
        $scope.question.answerOptions.push(currAnswer);
    };

    // Show all questions
    $scope.getAllQuestions = function () {
        QuestionManager.getAllQuestions(function (data) {
            $scope.questions = data;
        });
    };

    // Update and add
    $scope.submitQuestion = function () {
        // Make sure no zero value properties of object gets posted.
        for (var property in $scope.question) {
            if ($scope.question.hasOwnProperty(property)) {
                if (property === ""){
                    delete $scope.question.property;
                }
            }
        }
        
        if ($scope.question._id) {
            QuestionManager.setQuestion($scope.question);
        } else {
            delete $scope.question._id; // Need to remove this in order for MongoDB integrity.
            QuestionManager.addQuestion($scope.question, function (newQuestion) {
                $scope.question = newQuestion;
            });
        }
        $scope.getAllQuestions();
    };

    // Delete a question
    $scope.deleteQuestion = function () {
        QuestionManager.deleteQuestion($scope.deleteId);
    };

    // Get questions by author
    $scope.getByAuthor = function () {
        QuestionManager.getQuestionBy($scope.question.cre8or, function(data){
            $scope.questionByAuthor = data;
        });
    };

    $scope.getAllQuestions();
}]);

/***********************************************************************************************************************
 * SUBMITTED
 **********************************************************************************************************************/

uat.controller('submittedCtrl',['$scope','SubmittedManager', function ($scope, SubmittedManager) {
    $scope.submitted = '';
    $scope.answerToAdd = {};
    $scope.submitteds = [];
    $scope.submittedByAuthor = [];
    $scope.submittedNeedCorr = [];
    $scope.deleteId = "";

    // Load a submitted
    $scope.loadSubmitted = function () {
        SubmittedManager.getSubmitted($scope.submitted._id, function (currSubmitted) {
            $scope.submitted = currSubmitted;
        });
    };

    // Add submitted to submitted
    $scope.addAnswer = function () {
        $scope.submitted.answerOptions.push($scope.answerToAdd);
    };

    // Show all submitteds
    $scope.getAllSubmitteds = function () {
        SubmittedManager.getAllSubmitted(function (data) {
            $scope.submitteds = data;
        });
    };

    // Update and add
    $scope.submitSubmitted = function () {
        // Make sure no zero value properties of object gets posted.
        for (var property in $scope.submitted) {
            if ($scope.submitted.hasOwnProperty(property)) {
                if (property === ""){
                    delete $scope.submitted.property;
                }
            }
        }
        
        if ($scope.submitted._id) {
            SubmittedManager.setSubmitted($scope.submitted);
        } else {
            console.log('Submitted should post. '+JSON.stringify($scope.submitted));
            delete $scope.submitted._id; // Need to remove this in order for MongoDB integrity.
            SubmittedManager.addSubmitted($scope.submitted, function (newSubmitted) {
                $scope.submitted = newSubmitted;
            });
        }
        $scope.getAllSubmitteds();
    };

    // Delete a submitted
    $scope.deleteSubmitted = function () {
        SubmittedManager.deleteSubmitted($scope.deleteId);
    };

    // Get submitteds by author
    $scope.getBy = function () {
        SubmittedManager.getSubmittedBy($scope.submitted.cre8or, function(data){
            $scope.submittedByAuthor = data;
        });
    };

    // Get need correction
    $scope.getNeedCorr = function () {
        SubmittedManager.getNeedCorrection(function (data){
            $scope.submittedNeedCorr = data;
        });
    }

    $scope.getAllSubmitteds();
}]);

/***********************************************************************************************************************
 * USER
 **********************************************************************************************************************/

uat.controller('userCtrl', ['$scope','UserManager',function ($scope, UserManager) {

    $scope.user = '';
    $scope.testToAdd = '';
    $scope.users = [];
    $scope.deleteId = "";

    // Load a user
    $scope.loadUser = function () {
        UserManager.getUser($scope.user._id, function (currUser) {
            $scope.user = currUser;
        });
    };

    // Add exam to users tests to take
    $scope.addExam = function () {
        $scope.user.testToTake.push($scope.testToAdd);
    };

    // Show all users
    $scope.getAllUsers = function () {
        UserManager.getAllUsers(function (data) {
            $scope.users = data;
        });
    };

    // Delete a class
    $scope.deleteUser = function () {
            UserManager.deleteUser($scope.deleteId);
    };
    
    // Update and add
    $scope.submitUser = function () {
        for (var property in $scope.user) {
            if ($scope.user.hasOwnProperty(property)) {
                if (property === ""){
                    delete $scope.user.property;
                }
            }
        }
        
        if ($scope.user._id) {
            UserManager.setUser($scope.user);
        } else {
            delete $scope.user._id; // Need to remove this in order for MongoDB integrity.
            UserManager.addUser($scope.user, function (newUser) {
                $scope.user = newUser;
            });
        }
        $scope.getAllUsers();
    };

    $scope.getAllUsers();
}]);
