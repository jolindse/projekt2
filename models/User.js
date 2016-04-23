/**
 * Created by Johan on 2016-04-21.
 */

var mongoose = require('mongoose');

/**
 *  Schema entry for the user db entities.
 */

var Exam = require('./Exam');

var userSchema = mongoose.Schema({

    // Basic information

    firstName:{
        type: String,
        required: true
    },
    surName:{
        type: String,
        required: true
    },
    id:{
        type: Number,
        required: true
    },
    password:{
        type: String,
        default: 'password'
    },
    email:{
        type: String,
        required: true
    },
    admin:{
        type: Boolean,
        default: false,
        required: true
    },

    // Data fields related to exams

    testToTake: {
        type: [{type: Schema.ObjectId,ref:'Exam'}]
    }

});

var User = module.exports = mongoose.model('User', userSchema);

/*
Functions for the entities.
 */

module.exports.getUsers = function(callback, limit){
    User.find(callback).limit(limit);
};