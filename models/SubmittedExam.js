/**
 * Created by Johan on 2016-04-22.
 * 
 * Entity model for submitted exam
 * 
 */
var mongoose = require('mongoose');
Schema = mongoose.Schema;

var submittedSchema = mongoose.Schema({

    // Basic information

    student: {
        type: String,
        required: true
    },
    exam: {
        type: String,
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

// Export model for application use.
var SubmittedExam = module.exports = mongoose.model('SubmittedExam', submittedSchema);

/*
Functions for the entity
 */

// Get a submitted exam
module.exports.getSubmitted = function(id, callback) {
  SubmittedExam.findById(id, callback);  
};

// Add a submitted exam
//TODO AUTOCORRECTION ROUTINES
module.exports.addSubmitted = function(submittedData, callback) {
  SubmittedExam.create(submittedData, callback);  
};

// Update a submitted exam
//TODO CHECK IF CORRECTION IS DONE ROUTINES OR DO IT IN ANGULAR?
module.exports.updateSubmitted = function(updatedSubmitted, callback) {
    SubmittedExam.findOneAndUpdate(
        {_id: id},
        updatedSubmitted,
        {upsert: false},
        callback
    );
};

// Delete a submitted exam
module.exports.deleteSubmitted = function(id, callback) {
    SubmittedExam.findOneAndRemove({_id: id}, callback);
};