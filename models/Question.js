/**
 * Created by Johan on 2016-04-22.
 */

var mongoose = require('mongoose');
Schema = mongoose.Schema;
var User = require('./User');

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
        required: true
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
        type: {type: Schema.ObjectId, ref: 'User'}
    }
    
});

var Question = module.exports = mongoose.model('Question', questionSchema);