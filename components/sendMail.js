/**
 * Created by Mattias on 2016-05-01.
 */


var mailer = require('nodemailer');
var User = require('../models/User');
var Exam = require('../models/Exam');

module.exports.sendMail = function(recipients, callback) {
    var transporter = mailer.createTransport("SMTP", {
        pool: true,
        host : "smtp-mail.outlook.com",
        secureConnection : false,
        port : 587,
        auth : {
            user : 'newtonexam@outlook.com',
            pass : 'N3wt0n#x4m'
        }
    });
    
    var mailOptions = {
        from : '"Newton Testsystem" <newtonexam@hotmail.com>',
        to : '',
        subject : 'Du har ett test att skriva',
        html : '<h1>Du har ett test att skriva</h1> ' +
        'Var vänlig och logga in på <a href="http://localhost:3000">testportalen</a>' +
        ' för att se vilka test som finns tillgängliga för dig.'
    }

    var recMail = [];
    var recArray = [].concat(recipients.rec);
    recArray.forEach(function (rec) {
        User.getUser(rec, function (err, user) {
            recMail.push(user.email);
            if (recMail.length === recArray.length) {
                mailOptions.to = recMail;
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                        callback({
                            success: false,
                            error: err
                        });
                    } else {
                        callback({success: true});
                    }
                });
            }
        });
    });
};
