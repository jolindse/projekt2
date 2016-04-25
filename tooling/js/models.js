/**
 * Created by Johan on 2016-04-24.
 */
/***
 * MODELS and MODELMANAGERS for use in controllers.
 *
 * as derived from http://www.webdeveasy.com/angularjs-data-model/
 *
 */

/**
 * User
 */

uat.factory('User', [$http, function($http){
    function User(userData) {
        if (userData) {
            this.setData(userData);
        }
    };

    User.prototype = {
        setData: function(userData) {
            angular.extend(this, userData);
        },
        delete: function () {
            $http.delete('http://localhost:3000/api/user/'+userId);
        },
        update: function() {
            $http.put('http://localhost:3000/api/user/'+userId, this);
        }
    };
    return User;
}]);


uat.factory('userManager', [$http, $q, User, function($http, $q, User) {
    var userManager = {
        _pool: {},
        _retriveInstance: function(userId, userData) {
            var instance = this._pool[userId];

            if (instance) {
                instance.setData(userData);
            } else {
                instance = new User(userData);
                this._pool[userId] = instance;
            }

            return instance;
        },
        _search: function(userId) {
            return this._pool[userId];
        },
        _load: function(userId, deferred) {
            var scope = this;

            $http.get('http://localhost:3000/api/user/'+userId)
                .success(function(userData){
                  var user = scope._retriveInstance(userData._id, userData);
                    deferred.resolve(user);
                })
                .error(function(){
                    deferred.reject();
                });
        },
        /* Public methods */
        getUser: function (userId) {
            var deferred = $q.defer();
            var user = this._search(userId);
            if (user) {
                deferred.resolve(user);
            } else {
                this._load(userId, deferred);
            }
            return deferred.promise;
        },
        getAllUsers: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get('http://localhost:3000/api/user')
                .success(function(userArray){
                    var users = [];
                    userArray.forEach(function(userData){
                        var user = scope._retriveInstance(userData._id, userData);
                        users.push(user);
                    });
                    deferred.resolve(users);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        setUser: function(userData) {
            var scope = this;
            var user = this._search(userData._id);
            if (user) {
                user.setData(userData);
            } else {
                user = scope._retriveInstance(userData);
            }
            return user;
        },

    };
    return userManager;
}]);

/**
 * Exam
 */

uat.factory('Exam', [$http, function($http){
    function Exam(examData) {
        if (examData) {
            this.setData(examData);
        }
    };

    Exam.prototype = {
        setData: function(examData) {
            angular.extend(this, examData);
        },
        delete: function () {
            $http.delete('http://localhost:3000/api/exam/'+examId);
        },
        update: function() {
            $http.put('http://localhost:3000/api/exam/'+examId, this);
        }
    };
    return Exam;
}]);


uat.factory('examManager', [$http, $q, Exam, function($http, $q, Exam) {
    var examManager = {
        _pool: {},
        _retriveInstance: function(examId, examData) {
            var instance = this._pool[examId];

            if (instance) {
                instance.setData(examData);
            } else {
                instance = new Exam(examData);
                this._pool[examId] = instance;
            }

            return instance;
        },
        _search: function(examId) {
            return this._pool[examId];
        },
        _load: function(examId, deferred) {
            var scope = this;

            $http.get('http://localhost:3000/api/exam/'+examId)
                .success(function(examData){
                    var exam = scope._retriveInstance(examData._id, examData);
                    deferred.resolve(exam);
                })
                .error(function(){
                    deferred.reject();
                });
        },
        /* Public methods */
        getExam: function (examId) {
            var deferred = $q.defer();
            var exam = this._search(examId);
            if (exam) {
                deferred.resolve(exam);
            } else {
                this._load(examId, deferred);
            }
            return deferred.promise;
        },
        getAllExams: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get('http://localhost:3000/api/exam')
                .success(function(examArray){
                    var exams = [];
                    examArray.forEach(function(examData){
                        var exam = scope._retriveInstance(examData._id, examData);
                        exams.push(exam);
                    });
                    deferred.resolve(exams);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        setExam: function(examData) {
            var scope = this;
            var exam = this._search(examData._id);
            if (exam) {
                exam.setData(examData);
            } else {
                exam = scope._retriveInstance(examData);
            }
            return exam;
        },

    };
    return examManager;
}]);

/**
 * Question
 */

uat.factory('Question', [$http, function($http){
    function Question(questionData) {
        if (questionData) {
            this.setData(questionData);
        }
    };

    Question.prototype = {
        setData: function(questionData) {
            angular.extend(this, questionData);
        },
        delete: function () {
            $http.delete('http://localhost:3000/api/question/'+questionId);
        },
        update: function() {
            $http.put('http://localhost:3000/api/question/'+questionId, this);
        }
    };
    return Question;
}]);


uat.factory('questionManager', [$http, $q, Question, function($http, $q, Question) {
    var questionManager = {
        _pool: {},
        _retriveInstance: function(questionId, questionData) {
            var instance = this._pool[questionId];

            if (instance) {
                instance.setData(questionData);
            } else {
                instance = new Question(questionData);
                this._pool[questionId] = instance;
            }

            return instance;
        },
        _search: function(questionId) {
            return this._pool[questionId];
        },
        _load: function(questionId, deferred) {
            var scope = this;

            $http.get('http://localhost:3000/api/question/'+questionId)
                .success(function(questionData){
                    var question = scope._retriveInstance(questionData._id, questionData);
                    deferred.resolve(question);
                })
                .error(function(){
                    deferred.reject();
                });
        },
        /* Public methods */
        getQuestion: function (questionId) {
            var deferred = $q.defer();
            var question = this._search(questionId);
            if (question) {
                deferred.resolve(question);
            } else {
                this._load(questionId, deferred);
            }
            return deferred.promise;
        },
        getAllQuestions: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get('http://localhost:3000/api/question')
                .success(function(questionArray){
                    var questions = [];
                    questionArray.forEach(function(questionData){
                        var question = scope._retriveInstance(questionData._id, questionData);
                        questions.push(question);
                    });
                    deferred.resolve(questions);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        setQuestion: function(questionData) {
            var scope = this;
            var question = this._search(questionData._id);
            if (question) {
                question.setData(questionData);
            } else {
                question = scope._retriveInstance(questionData);
            }
            return question;
        },

    };
    return questionManager;
}]);

/**
 * Submitted
 */

uat.factory('Submitted', [$http, function($http){
    function Submitted(submittedData) {
        if (submittedData) {
            this.setData(submittedData);
        }
    };

    Submitted.prototype = {
        setData: function(submittedData) {
            angular.extend(this, submittedData);
        },
        delete: function () {
            $http.delete('http://localhost:3000/api/submitted/'+submittedId);
        },
        update: function() {
            $http.put('http://localhost:3000/api/submitted/'+submittedId, this);
        }
    };
    return Submitted;
}]);


uat.factory('submittedManager', [$http, $q, Submitted, function($http, $q, Submitted) {
    var submittedManager = {
        _pool: {},
        _retriveInstance: function(submittedId, submittedData) {
            var instance = this._pool[submittedId];

            if (instance) {
                instance.setData(submittedData);
            } else {
                instance = new Submitted(submittedData);
                this._pool[submittedId] = instance;
            }

            return instance;
        },
        _search: function(submittedId) {
            return this._pool[submittedId];
        },
        _load: function(submittedId, deferred) {
            var scope = this;

            $http.get('http://localhost:3000/api/submitted/'+submittedId)
                .success(function(submittedData){
                    var submitted = scope._retriveInstance(submittedData._id, submittedData);
                    deferred.resolve(submitted);
                })
                .error(function(){
                    deferred.reject();
                });
        },
        /* Public methods */
        getSubmitted: function (submittedId) {
            var deferred = $q.defer();
            var submitted = this._search(submittedId);
            if (submitted) {
                deferred.resolve(submitted);
            } else {
                this._load(submittedId, deferred);
            }
            return deferred.promise;
        },
        getAllSubmitteds: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get('http://localhost:3000/api/submitted')
                .success(function(submittedArray){
                    var submitteds = [];
                    submittedArray.forEach(function(submittedData){
                        var submitted = scope._retriveInstance(submittedData._id, submittedData);
                        submitteds.push(submitted);
                    });
                    deferred.resolve(submitteds);
                })
                .error(function() {
                    deferred.reject();
                });
            return deferred.promise;
        },
        setSubmitted: function(submittedData) {
            var scope = this;
            var submitted = this._search(submittedData._id);
            if (submitted) {
                submitted.setData(submittedData);
            } else {
                submitted = scope._retriveInstance(submittedData);
            }
            return submitted;
        },

    };
    return submittedManager;
}]);
