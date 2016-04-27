/**
 * Created by Johan on 2016-04-24.
 */
/***
 * MODELS and MODELMANAGERS for use in controllers.
 *
 * as derived from http://www.webdeveasy.com/angularjs-data-model/
 *
 */

uat.constant('APIBASEURL', 'http://localhost:3000');

/***********************************************************************************************************************
 * USER
 *
 /api/user                    GET        -            [user]                Gets ALL users
 /api/user                    POST    user        -                    Adds a user
 /api/user/(id)            PUT        user        -                    Updates a user
 /api/user/(id)                GET    -            user                Gets specific user
 /api/user/(id)                DELETE    -            -                    Deletes a user
 /api/user/login/(id)        POST    user.id        login:bool            Login, returns true or false
 *
 *
 user:
 {
     _id: 				MongoDB id
     firstName:			String
     surName:			String
     id:					Number (personnummer)
     password:			String (Hash later?)
     email:				String
     admin:				Boolean
     testToTake: 		[exam._id,exam._id...]
 }
 *
 **********************************************************************************************************************/

uat.factory('User', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function User(userData) {
        this.setData(userData);
    };

    User.prototype = {
        setData: function (userData) {
            angular.extend(this, userData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/class/' + this._id);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/class/' + this._id, this);
        }
    };
    return User;
}]);


uat.factory('UserManager', ['$http', '$q', 'User', 'APIBASEURL', function ($http, $q, User, APIBASEURL) {
    var UserManager = {
        _pool: {},
        _retriveInstance: function (userId, userData) {
            var instance = UserManager._pool[userId];
            if (instance) {
                instance.setData(userData);
            } else {
                instance = new User(userData);
                this._pool[userId] = instance;
            }
            return instance;
        },
        _search: function (userId) {
            return this._pool[userId];
        },
        _save: function (userData, callback) {
            $http.post(APIBASEURL + '/api/class', userData)
                .success(function (response) {
                    var user = UserManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (userId, deferred) {
            $http.get(APIBASEURL + '/api/class/' + userId)
                .success(function (userData) {
                    var user = UserManager._retriveInstance(userId, userData);
                    deferred.resolve(user);
                })
                .error(function () {
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
        addUser: function (userData, callback) {
            this._save(userData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllUseres: function () {
            var deferred = $q.defer();
            $http.get(APIBASEURL + '/api/class')
                .success(function (userArray) {
                    var useres = [];
                    userArray.forEach(function (userData) {
                        var user = this._retriveInstance(userData._id, userData);
                        useres.push(user);
                    });
                    deferred.resolve(users);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        },
        setUser: function (userData) {
            var user = this._search(userData._id);
            if (user) {
                user.setData(userData);
            } else {
                user = this._retriveInstance(userData);
            }
            return user;
        }
    };
    return UserManager;
}]);

/***********************************************************************************************************************
 * EXAM
 *
 /api/exam                    GET    -            [exam]                Gets ALL exams
 /api/exam                    POST    exam        -                    Adds a exam
 /api/exam/(id)                PUT    exam        -                    Updates a exam
 /api/exam/(id)                GET    -            [exam,[questions]]    Gets a specific exam with its questions
 /api/exam/(id)                DELETE    -            -                    Deletes a exam and all submitted that relates to it
 /api/exam/cre8or/(id)        GET    -            [exam]                Gets all exams by a cre8or
 *
 *
 exam:
 {
     _id:				MongoDB id
     title:				String
     subject:			String
     interval:			[Date.start,Date.end]
     time:				Number (minutes)
     type:              String
     gradePercentage:	[Number.G_Threshold,Number.VG_Threshold]
     anonymous:			Boolean
     feedback:			Boolean
     questions:			[question._id,question_id...]
     cre8or:				user._id
 }
 *
 **********************************************************************************************************************/

uat.factory('Exam', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function Exam(examData) {
        this.setData(examData);
    };

    Exam.prototype = {
        setData: function (examData) {
            angular.extend(this, examData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/class/' + this._id);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/class/' + this._id, this);
        }
    };
    return Exam;
}]);


uat.factory('ExamManager', ['$http', '$q', 'Exam', 'APIBASEURL', function ($http, $q, Exam, APIBASEURL) {
    var ExamManager = {
        _pool: {},
        _retriveInstance: function (examId, examData) {
            var instance = ExamManager._pool[examId];
            if (instance) {
                instance.setData(examData);
            } else {
                instance = new Exam(examData);
                this._pool[examId] = instance;
            }
            return instance;
        },
        _search: function (examId) {
            return this._pool[examId];
        },
        _save: function (examData, callback) {
            $http.post(APIBASEURL + '/api/class', examData)
                .success(function (response) {
                    var exam = ExamManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (examId, deferred) {
            $http.get(APIBASEURL + '/api/class/' + examId)
                .success(function (examData) {
                    var exam = ExamManager._retriveInstance(examId, examData);
                    deferred.resolve(exam);
                })
                .error(function () {
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
        addExam: function (examData, callback) {
            this._save(examData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllExames: function () {
            var deferred = $q.defer();
            $http.get(APIBASEURL + '/api/class')
                .success(function (examArray) {
                    var exames = [];
                    examArray.forEach(function (examData) {
                        var exam = this._retriveInstance(examData._id, examData);
                        exames.push(exam);
                    });
                    deferred.resolve(exams);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        },
        getExamBy: function (cre8orId) {
            var deferred = $q.defer();
            var scope = this;
            $http.get(APIBASEURL + '/api/exam/cre8or/' + cre8orId)
                .success(function (examArray) {
                    var exams = [];
                    examArray.forEach(function (examData) {
                        var exam = scope._retriveInstance(examData._id, examData);
                        exams.push(exam);
                    });
                    deferred.resolve(exams);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        }
    };
    return examManager;
}]);

/***********************************************************************************************************************
 * QUESTION
 *
 /api/question                GET    -            [question]            Gets ALL questions
 /api/question                POST    question    -                    Adds a question
 /api/question/(id)            PUT    question    -                    Updates a question
 /api/question/(id)        GET    -            question            Gets a specific question
 /api/question/(id)        DELETE    -            -                    Deletes a question
 /api/question/cre8or/(id)    GET    -            [question]            Gets all questions by a cre8or
 *
 *
 question:
 {
     _id:				MongoDB id
     title:				String
     questionText:		String
     type:				String (Multi,Rank,Text)
     answerOption:		[answerObject:{
                                 text: 		String
                                 correct:	Boolean
                                 },...]
     vgQuestion:			Boolean
     extraInfo:			String
     imageUrl:			String
     points:				Number
     cre8or:				user._id
 }
 *
 **********************************************************************************************************************/

uat.factory('Question', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function Question(questionData) {
        this.setData(questionData);
    };

    Question.prototype = {
        setData: function (questionData) {
            angular.extend(this, questionData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/class/' + this._id);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/class/' + this._id, this);
        }
    };
    return Question;
}]);


uat.factory('QuestionManager', ['$http', '$q', 'Question', 'APIBASEURL', function ($http, $q, Question, APIBASEURL) {
    var QuestionManager = {
        _pool: {},
        _retriveInstance: function (questionId, questionData) {
            var instance = QuestionManager._pool[questionId];
            if (instance) {
                instance.setData(questionData);
            } else {
                instance = new Question(questionData);
                this._pool[questionId] = instance;
            }
            return instance;
        },
        _search: function (questionId) {
            return this._pool[questionId];
        },
        _save: function (questionData, callback) {
            $http.post(APIBASEURL + '/api/class', questionData)
                .success(function (response) {
                    var question = QuestionManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (questionId, deferred) {
            $http.get(APIBASEURL + '/api/class/' + questionId)
                .success(function (questionData) {
                    var question = QuestionManager._retriveInstance(questionId, questionData);
                    deferred.resolve(question);
                })
                .error(function () {
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
        addQuestion: function (questionData, callback) {
            this._save(questionData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllQuestiones: function () {
            var deferred = $q.defer();
            $http.get(APIBASEURL + '/api/class')
                .success(function (questionArray) {
                    var questiones = [];
                    questionArray.forEach(function (questionData) {
                        var question = this._retriveInstance(questionData._id, questionData);
                        questiones.push(question);
                    });
                    deferred.resolve(questions);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        },
        getQuestionBy: function (cre8orId) {
            var deferred = $q.defer();
            var scope = this;
            $http.get(APIBASEURL + '/api/question/cre8or/' + cre8orId)
                .success(function (questionArray) {
                    var questions = [];
                    questionArray.forEach(function (questionData) {
                        var question = scope._retriveInstance(questionData._id, questionData);
                        questions.push(question);
                    });
                    deferred.resolve(questions);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        }
    };
    return questionManager;
}]);

/***********************************************************************************************************************
 * SUBMITTED
 *
 /api/submitted                POST    submitted    -                    Adds a submitted exam
 /api/submitted/(id)        GET    -            submitted            Gets a specific submitted exam
 /api/submitted/(id)        PUT    submitted    -                    Updates a submitted exam
 /api/submitted/(id)        DELETE    -            -                    Deletes a submitted exam
 /api/submitted/user/(id)    GET    -            [submitted]            Gets ALL submitted exams by a student
 //TODO ADD NEW ENDPOINT FOR ALL TESTS THAT NEED CORRECTION
 *
 *
 submitted:
 {
     _id:				MongoDB id
     student:			user._id
     exam:				exam._id
     answers:			[submittedAnswerObject:{
                                 text:		String
                                 comment:	String
                                 correct:	Boolean
                                 corrected:	Boolean
                                 points:		Number
                         },...]
     comment:			String
     completeCorrection:	Boolean
     grade:				String
     points:				Number
 }
 *
 **********************************************************************************************************************/

uat.factory('Submitted', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function Submitted(submittedData) {
        this.setData(submittedData);
    };

    Submitted.prototype = {
        setData: function (submittedData) {
            angular.extend(this, submittedData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/class/' + this._id);
        },
        deleteAll: function () {
            $http.delete(APIBASEURL + '/api/class/remove' + this._id);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/class/' + this._id, this);
        }
    };
    return Submitted;
}]);


uat.factory('SubmittedManager', ['$http', '$q', 'Submitted', 'APIBASEURL', function ($http, $q, Submitted, APIBASEURL) {
    var SubmittedManager = {
        _pool: {},
        _retriveInstance: function (submittedId, submittedData) {
            var instance = SubmittedManager._pool[submittedId];
            if (instance) {
                instance.setData(submittedData);
            } else {
                instance = new Submitted(submittedData);
                this._pool[submittedId] = instance;
            }
            return instance;
        },
        _search: function (submittedId) {
            return this._pool[submittedId];
        },
        _save: function (submittedData, callback) {
            $http.post(APIBASEURL + '/api/class', submittedData)
                .success(function (response) {
                    var submitted = SubmittedManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (submittedId, deferred) {
            $http.get(APIBASEURL + '/api/class/' + submittedId)
                .success(function (submittedData) {
                    var submitted = SubmittedManager._retriveInstance(submittedId, submittedData);
                    deferred.resolve(submitted);
                })
                .error(function () {
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
        addSubmitted: function (submittedData, callback) {
            this._save(submittedData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllSubmittedes: function () {
            var deferred = $q.defer();
            $http.get(APIBASEURL + '/api/class')
                .success(function (submittedArray) {
                    var submittedes = [];
                    submittedArray.forEach(function (submittedData) {
                        var submitted = this._retriveInstance(submittedData._id, submittedData);
                        submittedes.push(submitted);
                    });
                    deferred.resolve(submitteds);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        },
        getSubmittedBy: function (studentId) {
            var deferred = $q.defer();
            var scope = this;
            $http.get(APIBASEURL + '/api/submitted/user/' + studentId)
                .success(function (submittedArray) {
                    var submitteds = [];
                    submittedArray.forEach(function (submittedData) {
                        var submitted = scope._retriveInstance(submittedData._id, submittedData);
                        submitteds.push(submitted);
                    });
                    deferred.resolve(submitteds);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        }
    };
    return submittedManager;
}]);

/***********************************************************************************************************************
 * CLASS
 *
 /api/class                    GET    -            [class]                Gets ALL classes
 *
 *
 class:
 {
     _id:				MongoDB id
     name:				String
     students:			[user._id,user._id...]
 }
 *
 **********************************************************************************************************************/

uat.factory('StudentClass', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function StudentClass(studentClassData) {
        this.setData(studentClassData);
    };

    StudentClass.prototype = {
        setData: function (studentClassData) {
            angular.extend(this, studentClassData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/class/' + this._id);
        },
        deleteAll: function () {
            $http.delete(APIBASEURL + '/api/class/remove' + this._id);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/class/' + this._id, this);
        }
    };
    return StudentClass;
}]);


uat.factory('StudentClassManager', ['$http', '$q', 'StudentClass', 'APIBASEURL', function ($http, $q, StudentClass, APIBASEURL) {
    var StudentClassManager = {
        _pool: {},
        _retriveInstance: function (studentClassId, studentClassData) {
            var instance = StudentClassManager._pool[studentClassId];
            if (instance) {
                instance.setData(studentClassData);
            } else {
                instance = new StudentClass(studentClassData);
                StudentClassManager._pool[studentClassId] = instance;
            }
            return instance;
        },
        _search: function (studentClassId) {
            return StudentClassManager._pool[studentClassId];
        },
        _save: function (studentClassData, callback) {
            $http.post(APIBASEURL + '/api/class', studentClassData)
                .success(function (response) {
                    var studentClass = StudentClassManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (studentClassId, deferred) {
            $http.get(APIBASEURL + '/api/class/' + studentClassId)
                .success(function (studentClassData) {
                    var studentClass = StudentClassManager._retriveInstance(studentClassId, studentClassData);
                    deferred.resolve(studentClass);
                })
                .error(function () {
                    deferred.reject();
                });
        },
        /* Public methods */
        getStudentClass: function (studentClassId) {
            var deferred = $q.defer();
            var studentClass = this._search(studentClassId);
            if (studentClass) {
                deferred.resolve(studentClass);
            } else {
                StudentClassManager._load(studentClassId, deferred);
            }
            return deferred.promise;
        },
        addStudentClass: function (studentClassData, callback) {
            StudentClassManager._save(studentClassData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllStudentClasses: function (callback) {
            $http.get(APIBASEURL + '/api/class')
                .success(function (studentClassArray) {
                    var studentClasses = [];
                    studentClassArray.forEach(function (studentClassData) {
                        var studentClass = StudentClassManager._retriveInstance(studentClassData._id, studentClassData);
                        studentClasses.push(studentClass);
                    });
                    callback(studentClassArray);
                })
        },
        setStudentClass: function (studentClassData) {
            var studentClass = StudentClassManager._search(studentClassData._id);
            if (studentClass) {
                studentClass.setData(studentClassData);
            } else {
                studentClass = StudentClassManager._retriveInstance(studentClassData);
            }
            return studentClass;
        }
    };
    return StudentClassManager;
}]);

