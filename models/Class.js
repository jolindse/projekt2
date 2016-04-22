/**
 * Created by Johan on 2016-04-22.
 */
var mongoose = require('mongoose');
Schema = mongoose.Schema;
var User = require('./User');

var classSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    students: {
        type: [{type:Schema.ObjectId,ref:'User'}]
    }
});

var Class = module.exports = mongoose.model('Class', classSchema);
