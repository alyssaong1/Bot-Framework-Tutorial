// Modules
var restify = require('restify');
var builder = require('botbuilder');
var rp = require('request-promise');
var emailSender = require('./emailSender.js');

// API Keys
var BINGSEARCHKEY = '*****YOUR SUBSCRIPTION KEY GOES HERE*****';
var CVKEY = '*****YOUR SUBSCRIPTION KEY GOES HERE*****';

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
// Listen for any activity on port 3978 of our local server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
// If a Post request is made to /api/messages on port 3978 of our local server, then we pass it to the bot connector to handle
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
var luisRecognizer = new builder.LuisRecognizer('Your LUIS URL here');

var intentDialog = new builder.IntentDialog({recognizers: [luisRecognizer]});

//This is called the root dialog. It is the first point of entry for any message the bot receives
bot.dialog('/', intentDialog);

intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
    .matches('GetNews', '/topNews')
    .matches('AnalyseImage', '/analyseImage')
    .matches('SendEmail', '/sendEmail')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));

bot.dialog('/sayHi', function(session) {
    session.send('Hi there!  Try saying things like "Get news in Toyko"');
    session.endDialog();
});

bot.dialog('/topNews', [
    function (session){
        // Ask the user which category they would like
        // Choices are separated by |
        builder.Prompts.choice(session, "Which category would you like?", "Technology|Science|Sports|Business|Entertainment|Politics|Health|World|(quit)");
    }, function (session, results, next){
        // The user chose a category
        if (results.response && results.response.entity !== '(quit)') {
           //Show user that we're processing their request by sending the typing indicator
            session.sendTyping();
            // Build the url we'll be calling to get top news
            var url = "https://api.cognitive.microsoft.com/bing/v5.0/news/?" 
                + "category=" + results.response.entity + "&count=10&mkt=en-US&originalImg=true";
            // Build options for the request
            var options = {
                uri: url,
                headers: {
                    'Ocp-Apim-Subscription-Key': BINGSEARCHKEY
                },
                json: true // Returns the response in json
            }
    //Make the call
    rp(options).then(function (body){
        // The request is successful
        sendTopNews(session, results, body);
    }).catch(function (err){
        // An error occurred and the request failed
        console.log(err.message);
        session.send("Argh, something went wrong. :( Try again?");
    }).finally(function () {
        // This is executed at the end, regardless of whether the request is successful or not
        session.endDialog();
    });
        } else {
            // The user choses to quit
            session.endDialog("Ok. Mission Aborted.");
        }
    }
]);

bot.dialog('/analyseImage', [
    function (session){
        // Ask the user which category they would like
        // Choices are separated by |
        builder.Prompts.text(session, "Enter an image url to get the caption for it: ");
    }, function (session, results, next){
        // The user chose a category
        if (results.response) {
           //Show user that we're processing their request by sending the typing indicator
            session.sendTyping();
            // Build the url we'll be calling to get top news
            var url = "https://westus.api.cognitive.microsoft.com/vision/v1.0/describe/";
            // Build options for the request
            var options = {
                        method: 'POST', // thie API call is a post request
                        uri: url,
                        headers: {
                            'Ocp-Apim-Subscription-Key': CVKEY,
                            'Content-Type': "application/json"
                        },
                        body: {
                            url: results.response,
                            language: 'en'
                        },
                        json: true
                    }
            //Make the call
            rp(options).then(function (body){
                // The request is successful
                console.log(body["description"]["captions"]);
                session.send(body["description"]["captions"][0]["text"]);
            }).catch(function (err){
                // An error occurred and the request failed
                session.send("Argh, something went wrong. :( Try again?");
            }).finally(function () {
                // This is executed at the end, regardless of whether the request is successful or not
                session.endDialog();
            });
        } else {
            // The user choses to quit
            session.endDialog("Ok. Mission Aborted.");
        }
    }
]);

bot.dialog('/sendEmail', [
    function(session){
        session.send("I can send an email to your team member on Earth, what's his/her address?");
        builder.Prompts.text(session, "Enter an image url to get the caption for it: ");
    },
    function(session, results)
    {
        var emailAddress = results.response;
        emailSender.sendEmail(emailAddress, function(err){
            if(!err)
            {
                session.send("I've successfully sent an email to your team.");
            }
            else
            {
                session.send("Error sending email");
            }
        })
    }
]);

// This function processes the results from the API call to category news and sends it as cards
function sendTopNews(session, results, body){
    session.send("Top news in " + results.response.entity + ": ");
    //Show user that we're processing by sending the typing indicator
    session.sendTyping();
    // The value property in body contains an array of all the returned articles
    var allArticles = body.value;
    var cards = [];
    // Iterate through all 10 articles returned by the API
    for (var i = 0; i < 10; i++){
        var article = allArticles[i];
        // Create a card for the article and add it to the list of cards we want to send
        cards.push(new builder.HeroCard(session)
            .title(article.name)
            .subtitle(article.datePublished)
            .images([
                //handle if thumbnail is empty
                builder.CardImage.create(session, article.image.contentUrl)
            ])
            .buttons([
                // Pressing this button opens a url to the actual article
                builder.CardAction.openUrl(session, article.url, "Full article")
            ]));
    }
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);
    session.send(msg);
}