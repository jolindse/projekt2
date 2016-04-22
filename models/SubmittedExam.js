/**
 * Created by Johan on 2016-04-22.
 */
var mongoose = require('mongoose');
Schema = mongoose.Schema;
var User = require('./User');
var Exam = require('./Exam');

var submittedSchema = mongoose.Schema({

    // Basic information

    student: {
        type: {type: Schema.ObjectId, ref: 'User'},
        required: true
    },
    exam: {
        type: {type: Schema.ObjectId, ref: 'Exam'},
        required: true
    },
    answers: {
        type: Array,
        required: true
    },
    comment: {
        type: String
    },
    completedCorrection: {
        type: Boolean,
        default: false
    },
    grade: {
        type: String
    },
    points: {
        type: Number
    }
});

var SubmittedExam = module.exports = mongoose.model('SubmittedExam', submittedSchema);
