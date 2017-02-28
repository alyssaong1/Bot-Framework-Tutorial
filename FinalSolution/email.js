//Top level object
var emailSender = {};

/*
nodemailer
*/
var nodemailer = require('nodemailer');
var wellknown = require('nodemailer-wellknown');
var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'marsbothol@outlook.com',
        pass: 'marsmission97'
    }
});

emailSender.sendEmail = function (callback)
{
    var mailOptions =
    {
        from: '"Mars Bot" <marsbothol@outlook.com>',
        to: room.email,
        subject: 'Message from Mars',
        text: 'Hello from Mars Bot!' 
    }

    transporter.sendMail(mailOptions, function(err, info){
        if(!err)
        {
            console.log('Message successfully sent: ' + info.response);
            callback(null);
        }
        else
        {
            console.log(err);
            callback(err);
        }
    });
}

module.exports = emailSender;