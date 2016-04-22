/**
 * Created by Johan on 2016-04-22.
 */
var User = require('./User');

var questionSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    students: {
        type: [{type:Schema.ObjectId,ref:'User'}]
    }
});

var User = module.exports = mongoose.model('User', userSchema);
