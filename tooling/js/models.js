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

uat.factory('User', ['$http', function ($http) {
    function User(userData) {
        if (userData) {
            this.setData(userData);
        }
    };

    User.prototype = {
        setData: function (userData) {
            angular.extend(this, userData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/user/' + userId);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/user/' + userId, this);
        }
    };
    return User;
}]);


uat.factory('userManager', ['$http', '$q', 'User', function ($http, $q, User) {
    var userManager = {
        _pool: {},
        _retriveInstance: function (userId, userData) {
            var instance = this._pool[userId];

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
        _load: function (userId, deferred) {
            var scope = this;

            $http.get(APIBASEURL + 'api/user/' + userId)
                .success(function (userData) {
                    var user = scope._retriveInstance(userData._id, userData);
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
        getAllUsers: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get(APIBASEURL + '/api/user')
                .success(function (userArray) {
                    var users = [];
                    userArray.forEach(function (userData) {
                        var user = scope._retriveInstance(userData._id, userData);
                        users.push(user);
                    });
                    deferred.resolve(users);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        },
        setUser: function (userData) {
            var scope = this;
            var user = this._search(userData._id);
            if (user) {
                user.setData(userData);
            } else {
                user = scope._retriveInstance(userData);
            }
            return user;
        }
    };
    return userManager;
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

uat.factory('Exam', ['$http', function ($http) {
    function Exam(examData) {
        if (examData) {
            this.setData(examData);
        }
    };

    Exam.prototype = {
        setData: function (examData) {
            angular.extend(this, examData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/exam/' + examId);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/exam/' + examId, this);
        }
    };
    return Exam;
}]);


uat.factory('examManager', ['$http', '$q', 'Exam', function ($http, $q, Exam) {
    var examManager = {
        _pool: {},
        _retriveInstance: function (examId, examData) {
            var instance = this._pool[examId];

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
        _load: function (examId, deferred) {
            var scope = this;

            $http.get(APIBASEURL + '/api/exam/' + examId)
                .success(function (examData) {
                    var exam = scope._retriveInstance(examData._id, examData);
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
        getAllExams: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get(APIBASEURL + '/api/exam')
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
        },
        setExam: function (examData) {
            var scope = this;
            var exam = this._search(examData._id);
            if (exam) {
                exam.setData(examData);
            } else {
                exam = scope._retriveInstance(examData);
            }
            return exam;
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

uat.factory('Question', ['$http', function ($http) {
    function Question(questionData) {
        if (questionData) {
            this.setData(questionData);
        }
    };

    Question.prototype = {
        setData: function (questionData) {
            angular.extend(this, questionData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/question/' + questionId);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/question/' + questionId, this);
        }
    };
    return Question;
}]);


uat.factory('questionManager', ['$http', '$q', 'Question', function ($http, $q, Question) {
    var questionManager = {
        _pool: {},
        _retriveInstance: function (questionId, questionData) {
            var instance = this._pool[questionId];

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
        _load: function (questionId, deferred) {
            var scope = this;

            $http.get(APIBASEURL + '/api/question/' + questionId)
                .success(function (questionData) {
                    var question = scope._retriveInstance(questionData._id, questionData);
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
        getAllQuestions: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get(APIBASEURL + '/api/question')
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
        },
        setQuestion: function (questionData) {
            var scope = this;
            var question = this._search(questionData._id);
            if (question) {
                question.setData(questionData);
            } else {
                question = scope._retriveInstance(questionData);
            }
            return question;
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

uat.factory('Submitted', ['$http', function ($http) {
    function Submitted(submittedData) {
        if (submittedData) {
            this.setData(submittedData);
        }
    };

    Submitted.prototype = {
        setData: function (submittedData) {
            angular.extend(this, submittedData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/submitted/' + submittedId);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/submitted/' + submittedId, this);
        }
    };
    return Submitted;
}]);


uat.factory('submittedManager', ['$http', '$q', 'Submitted', function ($http, $q, Submitted) {
    var submittedManager = {
        _pool: {},
        _retriveInstance: function (submittedId, submittedData) {
            var instance = this._pool[submittedId];

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
        _load: function (submittedId, deferred) {
            var scope = this;

            $http.get(APIBASEURL + '/api/submitted/' + submittedId)
                .success(function (submittedData) {
                    var submitted = scope._retriveInstance(submittedData._id, submittedData);
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
        getAllSubmitteds: function () {
            var deferred = $q.defer();
            var scope = this;
            $http.get(APIBASEURL + '/api/submitted')
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
        },
        setSubmitted: function (submittedData) {
            var scope = this;
            var submitted = this._search(submittedData._id);
            if (submitted) {
                submitted.setData(submittedData);
            } else {
                submitted = scope._retriveInstance(submittedData);
            }
            return submitted;
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
 /api/class                POST    class        -                    Adds a class
 /api/class/(id)            PUT        class        -                    Updates a class
 /api/class/(id)            GET    -            [class,[user]]        Gets a specific class with its students
 /api/class/(id)            DELETE    -            -                    Deletes a class
 /api/class/remove/(id)        DELETE    -            -                    Deletes a class and ALL students that belong to it
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

uat.factory('StudentClass', ['$http', function ($http) {
    function StudentClass(studentClassData, _id, name, students) {
        if (studentClassData) {
            this.setData(studentClassData);
        } else {
          
        }
    };

    StudentClass.prototype = {
        setData: function (studentClassData) {
            angular.extend(this, studentClassData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/class/' + studentClassId);
        },
        deleteAll: function () {
            $http.delete(APIBASEURL + '/api/class/remove' + studenClassId);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/class/' + studentClassId, this);
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
        _save: function (studentClassData, deferred) {
            var scope = StudentClassManager;
            deferred = $q.defer();
            $http.post(APIBASEURL + '/api/class', studentClassData)
                .success(function (studentClassDataSaved) {
                    var studentClass = scope._retriveInstance(studentClassDataSaved._id, studentClassData);
                    console.log(studentClassDataSaved._id); // TEST
                    console.log('StudentClass in _save: ' + studentClass); // TEST
                    deferred.resolve(studentClass);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        },
        _load: function (studentClassId, deferred) {
            var scope = StudentClassManager;

            $http.get(APIBASEURL + '/api/class/' + studentClassId)
                .success(function (studentClassData) {
                    var studentClass = scope._retriveInstance(studentClassData._id, studentClassData);
                    deferred.resolve(studentClass);
                })
                .error(function () {
                    deferred.reject();
                });
        },
        /* Public methods */
        getStudentClass: function (studentClassId) {
            var deferred = $q.defer();
            var studentClass = StudentClassManager._search(studentClassId);
            if (studentClass) {
                deferred.resolve(studentClass);
            } else {
                StudentClassManager._load(studentClassId, deferred);
            }
            return deferred.promise;
        },
        getAllStudentClasses: function () {
            var deferred = $q.defer();
            var scope = StudentClassManager;
            $http.get(APIBASEURL + '/api/class')
                .success(function (studentClassArray) {
                    var studentClasses = [];
                    studentClassArray.forEach(function (studentClassData) {
                        var studentClass = scope._retriveInstance(studentClassData._id, studentClassData);
                        studentClasses.push(studentClass);
                    });
                    deferred.resolve(studentClasss);
                })
                .error(function () {
                    deferred.reject();
                });
            return deferred.promise;
        },
        setStudentClass: function (studentClassData) {
            var scope = StudentClassManager;
            var studentClass = StudentClassManager._search(studentClassData._id);
            if (studentClass) {
                studentClass.setData(studentClassData);
            } else {
                studentClass = scope._retriveInstance(studentClassData);
            }
            return studentClass;
        },
        addStudentClass: function (studentClassData) {
            var deffered = $q.defer();
            StudentClassManager._save(studentClassData).then(
                (function (studentClass) {
                    console.log('Id of studentclass: ' + studentClass._id); // TEST
                    if (studentClass) {
                        deffered.resolve(studentClass);
                        console.log(studentClass); // TEST
                        console.log('Should return newly created class');
                    } else {
                        deffered.reject();
                    }
                }));
            return deffered.promise;
        }
    };
    return StudentClassManager;
}]);

