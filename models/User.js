/**
 * Created by Johan on 2016-04-21.
 * 
 * User entity model. 
 * 
 **/

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({

    // Basic information
    firstName: {
        type: String,
        required: true
    },
    surName: {
        type: String,
        required: true
    },
    id: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        default: 'password'

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: Boolean,
        default: false

    },

    // Data fields related to exams
    // Array with Exam ids.
    testToTake: {
        type: Array,
        required: false
    }

});

// Export model for application use.
var User = module.exports = mongoose.model('User', userSchema);

/*
 Functions for the entity.
 */

// Get multiple users
module.exports.getUsers = function (callback) {
    User.find(callback);
};

// Get single user
module.exports.getUser = function(id, callback) {
    User.findById(id, callback);
};

// Get a user by login-id
module.exports.getUserByLogin = function(id, callback) {
    User.findOne(
        {id: id},
        callback);
};

// Updates a user
module.exports.updateUser = function(id, updatedUser, callback) {
    User.findOneAndUpdate(
        {_id: id},
        updatedUser,
        {upsert: false},
        callback
    );
};

// Add a user
module.exports.addUser = function (user, callback) {
    User.create(user, callback);
};

// Log in
module.exports.loginUser = function (id, callback) {
    User.findOne({id: id}, callback);
};

// Delete a user
module.exports.deleteUser = function (id, callback) {
    User.findOneAndRemove({_id: id}, callback);
};
