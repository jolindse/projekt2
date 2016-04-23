/**
 * Created by Johan on 2016-04-22.
 */

var User = require('./User');

var examSchema = mongoose.Schema({

    // Basic information

    title:{
        type: String,
        required: true
    },
    subject:{
        type: String,
        required: true
    },
    interval:{
        type: Array
    },
    time: {
        type: Number
    },
    type: {
        type: String
    },
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
    questions: {
        // HÄR SKALL DET VARA FRÅGE REFERENSER
    },
    cre8or: {
        type: {type:Schema.ObjectId,ref: 'User'}
    }
});

var Exam = module.exports = mongoose.model('Exam', examSchema);