/**
 * Created by Johan on 2016-04-24.
 */
/***
 * MODELS and MODELMANAGERS for use in controllers.
 *
 * as derived from http://www.webdeveasy.com/angularjs-data-model/
 * converted for callback behaviour in order for proper use in our
 * application.
 *
 * Each model is divided into two sections. One decorator for the object
 * from the server that adds basic functionality and one modelManager for
 * each model that behaves as a interface in the controller.
 *
 */

/***********************************************************************************************************************
 *
 user:
 {
     _id: 				MongoDB id
     firstName:			String
     surName:			String
     id:				Number (personnummer)
     password:			String (Hash later?)
     email:				String
     admin:				Boolean
     testToTake: 		[User._id,User._id...]
 }
 *
 **********************************************************************************************************************/

myApp.factory('User', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function User(userData) {
        this.setData(userData);
    };
    User.prototype = {
        setData: function (userData) {
            angular.extend(this, userData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/user/' + this._id);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/user/' + this._id, this);
        }
    };
    return User;
}]);

myApp.factory('UserManager', ['$http', '$q', 'User', 'APIBASEURL', function ($http, $q, User, APIBASEURL) {
    var UserManager = {
        _pool: {},
        _retriveInstance: function (userId, userData) {
            var instance = UserManager._pool[userId];
            if (!instance) {
                instance = new User(userData);
                UserManager._pool[userId] = instance;
            }
            return instance;
        },
        _search: function (userId) {
            return UserManager._pool[userId];
        },
        _save: function (userData, callback) {
            $http.post(APIBASEURL + '/api/user', userData)
                .success(function (response) {
                    UserManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (userId, callback) {
            $http.get(APIBASEURL + '/api/user/' + userId)
                .success(function (userData) {
                    var user = UserManager._retriveInstance(userId, userData);
                    callback(user);
                });
        },
        /* Public methods */
        getUser: function (userId, callback) {
            var user = this._search(userId);
            if (user) {
                callback(user);
            } else {
                UserManager._load(userId, function (data) {
                    callback(data);
                });
            }
        },
        deleteUser: function (id) {
            UserManager._load(id, function (currUser) {
                delete UserManager._pool.id;
                currUser.delete();
            });
        },
        addUser: function (userData, callback) {
            UserManager._save(userData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllUsers: function (callback) {
            $http.get(APIBASEURL + '/api/user')
                .success(function (userArray) {
                    var users = [];
                    userArray.forEach(function (userData) {
                        var user = UserManager._retriveInstance(userData._id, userData);
                        users.push(user);
                    });
                    callback(users);
                })
        },
        setUser: function (userData) {
            var user = UserManager._retriveInstance(userData._id, userData);
            user.update();
            return user;
        }
    };
    return UserManager;
}]);

/***********************************************************************************************************************
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

myApp.factory('Exam', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function Exam(examData) {
        this.setData(examData);
    };
    Exam.prototype = {
        setData: function (examData) {
            angular.extend(this, examData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/exam/' + this._id);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/exam/' + this._id, this);
        }
    };
    return Exam;
}]);

myApp.factory('ExamManager', ['$http', '$q', 'Exam', 'APIBASEURL', function ($http, $q, Exam, APIBASEURL) {
    var ExamManager = {
        _pool: {},
        _retriveInstance: function (examId, examData) {
            var instance = ExamManager._pool[examId];
            if (!instance) {
                instance = new Exam(examData);
                ExamManager._pool[examId] = instance;
            }
            return instance;
        },
        _search: function (examId) {
            return ExamManager._pool[examId];
        },
        _save: function (examData, callback) {
            $http.post(APIBASEURL + '/api/exam', examData)
                .success(function (response) {
                    ExamManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (examId, callback) {
            $http.get(APIBASEURL + '/api/Exam/' + examId)
                .success(function (examData) {
                    var exam = ExamManager._retriveInstance(examId, examData);
                    callback(exam);
                });
        },
        /* Public methods */
        getExam: function (examId, callback) {
            var exam = this._search(examId);
            if (exam) {
                callback(exam);
            } else {
                ExamManager._load(examId, function (data) {
                    callback(data);
                });
            }
        },
        addExam: function (examData, callback) {
            ExamManager._save(examData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllExams: function (callback) {
            $http.get(APIBASEURL + '/api/Exam')
                .success(function (examArray) {
                    var exams = [];
                    examArray.forEach(function (examData) {
                        var exam = ExamManager._retriveInstance(examData._id, examData);
                        exams.push(exam);
                    });
                    callback(exams);
                })
        },
        deleteExam: function (id) {
            ExamManager._load(id, function (currExam) {
                delete ExamManager._pool.id;
                currExam.delete();
            });
        },
        setExam: function (examData) {
            var exam = ExamManager._retriveInstance(examData._id, examData);
            exam.update();
            return exam;
        },
        getExamBy: function (cre8orId, callback) {
            var scope = this;
            $http.get(APIBASEURL + '/api/exam/cre8or/' + cre8orId)
                .success(function (examArray) {
                    var exams = [];
                    examArray.forEach(function (examData) {
                        var exam = scope._retriveInstance(examData._id, examData);
                        exams.push(exam);
                    });
                    callback(exams);
                })
        }
    };
    return ExamManager;
}]);

/***********************************************************************************************************************
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

myApp.factory('Question', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function Question(questionData) {
        this.setData(questionData);
    };
    Question.prototype = {
        setData: function (questionData) {
            angular.extend(this, questionData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/question/' + this._id);
        },
        update: function () {
            console.log('update in models data: '+JSON.stringify(this)); // TEST
            $http.put(APIBASEURL + '/api/question/' + this._id, this);
        }
    };
    return Question;
}]);

myApp.factory('QuestionManager', ['$http', '$q', 'Question', 'APIBASEURL', function ($http, $q, Question, APIBASEURL) {
    var QuestionManager = {
        _pool: {},
        _retriveInstance: function (questionId, questionData) {
            var instance = QuestionManager._pool[questionId];
            if (!instance) {
                instance = new Question(questionData);
                QuestionManager._pool[questionId] = instance;
            }
            return instance;
        },
        _search: function (questionId) {
            return QuestionManager._pool[questionId];
        },
        _save: function (questionData, callback) {
            $http.post(APIBASEURL + '/api/question', questionData)
                .success(function (response) {
                    QuestionManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (questionId, callback) {
            $http.get(APIBASEURL + '/api/question/' + questionId)
                .success(function (questionData) {
                    var question = QuestionManager._retriveInstance(questionId, questionData);
                    callback(question);
                });
        },
        /* Public methods */
        getQuestion: function (questionId, callback) {
            var question = this._search(questionId);
            if (question) {
                callback(question);
            } else {
                QuestionManager._load(questionId, function (data) {
                    callback(data);
                });
            }
        },
        addQuestion: function (questionData, callback) {
            QuestionManager._save(questionData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllQuestions: function (callback) {
            $http.get(APIBASEURL + '/api/question')
                .success(function (questionArray) {
                    var questions = [];
                    questionArray.forEach(function (questionData) {
                        var question = QuestionManager._retriveInstance(questionData._id, questionData);
                        questions.push(question);
                    });
                    callback(questions);
                })
        },
        setQuestion: function (questionData) {
            var question = QuestionManager._retriveInstance(questionData._id, questionData);
            question.update();
            return question;
        },
        deleteQuestion: function (id) {
            QuestionManager._load(id, function (currQuestion) {
                delete QuestionManager._pool.id;
                currQuestion.delete();
            });
        },
        getQuestionBy: function (cre8orId, callback) {
            var scope = this;
            $http.get(APIBASEURL + '/api/question/cre8or/' + cre8orId)
                .success(function (questionArray) {
                    var questions = [];
                    questionArray.forEach(function (questionData) {
                        var question = scope._retriveInstance(questionData._id, questionData);
                        questions.push(question);
                    });
                    callback(questions);
                })
        }
    };
    return QuestionManager;
}]);

/***********************************************************************************************************************
 *
 submitted:
 {
     _id:				MongoDB id
     student:			user._id
     User:				User._id
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

myApp.factory('Submitted', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
    function Submitted(submittedData) {
        this.setData(submittedData);
    };
    Submitted.prototype = {
        setData: function (submittedData) {
            angular.extend(this, submittedData);
        },
        delete: function () {
            $http.delete(APIBASEURL + '/api/submitted/' + this._id);
        },
        update: function () {
            $http.put(APIBASEURL + '/api/submitted/' + this._id, this);
        }
    };
    return Submitted;
}]);

myApp.factory('SubmittedManager', ['$http', '$q', 'Submitted', 'APIBASEURL', function ($http, $q, Submitted, APIBASEURL) {
    var SubmittedManager = {
        _pool: {},
        _retriveInstance: function (submittedId, submittedData) {
            var instance = SubmittedManager._pool[submittedId];
            if (!instance) {
                instance = new Submitted(submittedData);
                SubmittedManager._pool[submittedId] = instance;
            }
            return instance;
        },
        _search: function (submittedId) {
            return SubmittedManager._pool[submittedId];
        },
        _save: function (submittedData, callback) {
            $http.post(APIBASEURL + '/api/submitted', submittedData)
                .success(function (response) {
                    SubmittedManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (submittedId, callback) {
            $http.get(APIBASEURL + '/api/submitted/' + submittedId)
                .success(function (submittedData) {
                    var submitted = SubmittedManager._retriveInstance(submittedId, submittedData);
                    callback(submitted);
                });
        },
        /* Public methods */
        getSubmitted: function (submittedId, callback) {
            var submitted = this._search(submittedId);
            if (submitted) {
                callback(submitted);
            } else {
                SubmittedManager._load(submittedId, function (data) {
                    callback(data);
                });
            }
        },
        addSubmitted: function (submittedData, callback) {
            SubmittedManager._save(submittedData, function (savedSubmitted) {
                callback(savedSubmitted);
            });
        },
        getAllSubmitted: function (callback) {
            $http.get(APIBASEURL + '/api/submitted')
                .success(function (submittedArray) {
                    var submitteds = [];
                    submittedArray.forEach(function (submittedData) {
                        var submitted = SubmittedManager._retriveInstance(submittedData._id, submittedData);
                        submitteds.push(submitted);
                    });
                    callback(submitteds);
                })
        },
        setSubmitted: function (submittedData) {
            var submitted = SubmittedManager._retriveInstance(submittedData._id, submittedData);
            submitted.update();
            return submitted;
        },
        deleteSubmitted: function (id) {
            SubmittedManager._load(id, function (currSubmitted) {
                delete SubmittedManager._pool.id;
                currSubmitted.delete();
            });
        },
        getSubmittedBy: function (studentId, callback) {
            var scope = this;
            $http.get(APIBASEURL + '/api/submitted/user/' + studentId)
                .success(function (submittedArray) {
                    var sub = [];
                    submittedArray.forEach(function (submittedData) {
                        var submitted = scope._retriveInstance(submittedData._id, submittedData);
                        sub.push(submitted);
                    });
                    callback(sub);
                })
        },
        getNeedCorrection: function (callback) {
            var scope = this;
            $http.get(APIBASEURL + '/api/submittedneedcorr')
                .success(function (needCorrArray) {
                    var needCorr = [];
                    needCorrArray.forEach(function (currSub) {
                        var currNeedCorr = scope._retriveInstance(currSub._id, currSub);
                        needCorr.push(currNeedCorr);
                    });
                    callback(needCorr);
                })
        }
    };
    return SubmittedManager;
}]);

/***********************************************************************************************************************
 *
 class:
 {
     _id:				MongoDB id
     name:				String
     students:			[user._id,user._id...]
 }
 *
 **********************************************************************************************************************/

myApp.factory('StudentClass', ['$http', 'APIBASEURL', function ($http, APIBASEURL) {
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

myApp.factory('StudentClassManager', ['$http', '$q', 'StudentClass', 'APIBASEURL', function ($http, $q, StudentClass, APIBASEURL) {
    var StudentClassManager = {
        _pool: {},
        _retriveInstance: function (studentClassId, studentClassData) {
            var instance = StudentClassManager._pool[studentClassId];
            if (!instance) {
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
                    StudentClassManager._retriveInstance(response._id, response);
                    callback(response);
                });
        },
        _load: function (studentClassId, callback) {
            $http.get(APIBASEURL + '/api/class/' + studentClassId)
                .success(function (studentClassData) {
                    var studentClass = StudentClassManager._retriveInstance(studentClassId, studentClassData);
                    callback(studentClass);
                });
        },
        /* Public methods */
        getStudentClass: function (studentClassId, callback) {
            var studentClass = this._search(studentClassId);
            if (studentClass) {
                callback(studentClass);
            } else {
                StudentClassManager._load(studentClassId, function (data) {
                    callback(data);
                });
            }
        },
        deleteClass: function (id, callback) {
            StudentClassManager._load(id, function (currClass) {
                delete StudentClassManager._pool.id;
                currClass.delete();
                callback();
            });
        },
        deleteClassFull: function (id) {
            StudentClassManager._load(id, function (currClass) {
                delete StudentClassManager._pool.id;
                currClass.deleteAll();
            });
        },
        addStudentClass: function (studentClassData, callback) {
            StudentClassManager._save(studentClassData, function (savedClass) {
                callback(savedClass);
            });
        },
        getAllStudentClasses: function (callback) {
            $http.get(APIBASEURL + '/api/class')
                .success(function (studentClassArray) {
                    var studentClasss = [];
                    studentClassArray.forEach(function (studentClassData) {
                        var studentClass = StudentClassManager._retriveInstance(studentClassData._id, studentClassData);
                        studentClasss.push(studentClass);
                    });
                    callback(studentClasss);
                })
        },
        setStudentClass: function (studentClassData) {
            var studentClass = StudentClassManager._retriveInstance(studentClassData._id, studentClassData);
            studentClass.update();
            return studentClass;
        }
    };
    return StudentClassManager;
}]);
