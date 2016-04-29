/**
 * Exam entity class
 */

var mongoose = require('mongoose');
var Question = require('./Question');

Schema = mongoose.Schema;

var examSchema = mongoose.Schema({

    // Basic information
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },

    // Array with start date, end date.
    interval: {
        type: Array
    },
    time: {
        type: Number
    },
    type: {
        type: String
    },

    // Array [0] = G percentage, [1] = VG percentage
    gradePercentage: {
        type: Array
    },
    anonymous: {
        type: Boolean,
        default: false
    },
    feedback: {
        type: Boolean,
        default: true
    },
    // Array with question ids.
    questions: {
        type: Array
    },
    // User id of cre8or
    cre8or: {
        type: String
    },
    // Max points for exam
    maxPoints: {
        type: Number,
        default: 0
    }
});

// Export model for application use.
var Exam = module.exports = mongoose.model('Exam', examSchema);

/*
 Functions for the entity.
 */

// List all exams
module.exports.getExams = function (callback) {
    Exam.find(callback);
};

// Get specific exam
module.exports.getExam = function (id, callback) {
    Exam.findById(id, callback);
};

// Add exam
module.exports.addExam = function (examData, callback) {
    examData.questions.forEach(function(question) {
        Question.getQuestion(question, function(err, question) {
            examData.maxPoints += question.points;
        });
    });
    Exam.create(examData, callback);
};

// Update exam
module.exports.updateExam = function(id, updatedExam, callback) {
  Exam.findOneAndUpdate(
      {_id: id},
      updatedExam,
      {upsert: false},
      callback
  );
};

// Delete exam
module.exports.deleteExam = function(id, callback) {
  Exam.findOneAndRemove({_id: id}, callback);
};

// Get by cre8or
module.exports.getByAuthor = function(id, callback) {
    Exam.find({cre8or:id});
};
