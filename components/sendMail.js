/**
 * Created by Mattias on 2016-05-01.
 */


var mailer = require('nodemailer');
var User = require('../models/User');

module.exports.sendMail = function(recipients, callback) {
    var transporter = mailer.createTransport("SMTP", {
        host : "smtp-mail.outlook.com",
        secureConnection : false,
        port : 587,
        auth : {
            user : 'mattias.larsson75@outlook.com',
            pass : 'mus00ven'
        }
    });

    var mailOptions = {
        from : '"Newton Testsystem" <test@newton.se>',
        to : '',
        subject : 'Du har ett test att skriva',
        html : '<h1>Du har ett test att skriva</h1> ' +
        'Klicka på <a href="länk till testet">länken</a> för att komma dit'
    }
    
    var recMail = [];
    recipients.rec.forEach(function(rec) {
        User.getUser(rec, function(err, user) {
            recMail.push(user.email);
            if (recMail.length === recipients.rec.length) {
                mailOptions.to = recMail;
                transporter.sendMail(mailOptions, function(err, info) {
                    if (err) {
                        console.log(err);
                        callback({success: false});
                    } else {
                        console.log('Meddelande sänt');
                        callback({success: true});
                    }
                });
            }
        });
    });
};
