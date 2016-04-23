/**
 * Created by Johan on 2016-04-22.
 *
 * Class entity model.
 *
 */
var mongoose = require('mongoose');

var classSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // Array with student ids.
    students: {
        type: Array
    }
});

// Export model for use in application.
var Class = module.exports = mongoose.model('Class', classSchema);

/*
 Entity functions.
 */

// List all classes
module.exports.getClasses = function (callback) {
    Class.find(callback);
};

// Get a class


// Add a class
module.exports.addClass = function (classData, callback) {
    Class.create(classData, callback);
};

// Update a class
module.exports.updateClass = function (id, updatedClass, callback) {
    Class.findOneAndUpdate(
        {_id: id},
        updatedClass,
        {upsert: false},
        callback
    );
};

// Delete a class
module.exports.deleteClass = function (id, callback) {
    Class.findOneAndRemove({_id: id}, callback);
};
