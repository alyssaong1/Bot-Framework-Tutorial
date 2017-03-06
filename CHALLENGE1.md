# Challenge 1: Sending an email back to Earth
The goal of this mission is to give the bot the functionality of sending emails back to Earth.

There are some things we need to implement in order to achieve this goal:

1. Enabling the bot to send emails (guided)
2. Getting the recipient email from the user (challenge)

## NPM installation
`nodemailer` is a useful npm that allows your NodeJS applications to send emails programatically.

Back in the command prompt (which should already be configured to your working directory), you can simply run these 2 commands to install the npms:

```shell
npm install nodemailer --save
npm install nodemailer-wellknown --save
```

## Utilizing nodemailer
Let's make a new javascript file in our directory to contain the logic for email sending. 

Right click the left panel area and create a new file in the main folder. Name it `emailSender.js`.

Let's first start by creating a new top level object to export. This is the object we will be exporting to the main script:

```js
//Top level object
var emailSender = {};
```

Next, we need to import the modules required:

```js
/*
nodemailer
*/
var nodemailer = require('nodemailer');
var wellknown = require('nodemailer-wellknown');
```

Nodemailer is a module that works with almost all email providers, but I'll be using hotmail in this scenario to create the nodemailer transport (an object that contains specifications for the email function).

```js
var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'marsbothol@outlook.com',
        pass: 'passwordhere' //password to account to be given at event
    }
});
```

We can then use our transport to create a function for sending emails. First, let's define a function:

```js
emailSender.sendEmail = function(recipientEmail, callback)
{
}
```

This function will take in a parameter for the email address we want to send the email to, 
as well as a callback function that will be called when the email sending function finishes.

In this method, we can then define the email we want to send, as well as call the sending function.

```js
emailSender.sendEmail = function(recipientEmail, callback)
{
    //Define email options and structure
    var mailOptions =
    {
        from: '"Mars Bot" <marsbothol@outlook.com>',
        to: recipientEmail, //insert the recipientEmail parameter
        subject: 'Message from Mars',
        text: 'Hello from Mars Bot!' 
    }

    //Send email using the options
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
```

Lastly, we can then export the top level object we defined to be accessed in our main script:

```js
module.exports = emailSender;
```

## Challenge
Now that we've made a js file for the email logic, we need to figure out how to get it to work with the bot.

First, place this at the top of `index.js` to import the emailSender logic:

```js
var emailSender = require('./emailSender');
```

We want to make it so that the bot will ask a user for an email address and then send an email to that address.

Here's a simple dialog to get you started: (make sure you include the dialog matching and train the correct intent in LUIS)

```js
intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
    .matches('GetNews', '/topNews')
    .matches('AnalyseImage', '/analyseImage')
    .matches('SendEmail', '/sendEmail')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));

bot.dialog('/sendEmail', [
    function(session){
        session.send("I can send an email to your team member on Earth, what's his/her address?");
    }
]);
```

Next, we need to ask the user for the email address and then send it into the function.

HINT: You can use the text prompt to ask a user for a email address, then pass that address into the sendEmail() function.

## Finishing Line
At the end, the bot should be able to ask for an email address and then send an email to that address.