/**
 * Created by Johan on 2016-04-22.
 *
 * Question entity model.
 *
 */

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var questionSchema = mongoose.Schema({

    // Basic information
    title:{
        type: String
    },
    questionText:{
        type: String,
        required: true
    },
    type: {
        type: String,
    },
    answerOptions: {
          type: Array
    },
    vgQuestion: {
        type: Boolean,
        default: false
    },
    extraInfo: {
        type: String
    },
    imageUrl: {
        type: String
    },
    points: {
        type: Number
    },
    cre8or: {
        type: String
    }
    
});

// Export model for use in application
var Question = module.exports = mongoose.model('Question', questionSchema);

/*
 Functions for the entity.
 */

// List all questions
module.exports.getQuestions = function (callback) {
    Question.find(callback);
};

// Get a question
module.exports.getQuestion = function (id, callback) {
    Question.findById(id, callback);
};

// Add question
module.exports.addQuestion = function (QuestionData, callback) {
    Question.create(QuestionData, callback);
};

// Update question
module.exports.updateQuestion = function(id, updatedQuestion, callback) {
    console.log('Updated question with id: '+id); // LOGG OUTPUT
    Question.findOneAndUpdate(
        {_id: id},
        updatedQuestion,
        {upsert: false},
        callback
    );
};

// Delete question
module.exports.deleteQuestion = function(id, callback) {
    Question.findOneAndRemove({_id: id}, callback);
};

// Get by cre8or
module.exports.getByAuthor = function(id, callback) {
    Question.find({cre8or: id}, callback);
};