#Building our News Bot

The bot we made in Part 1 currently returns 'Hello World' to anything you say. It's not very smart. In this part, we'll be building out the logic of our bot so it actually starts being useful. We'll be adding some natural language capabilities to our bot to help it understand user utterances as well.

###Simple keyword handling

First of all, let's make our bot respond to 'hello' and 'help', and tell the user it doesn't understand anything else. To do this, we'll be using an intents-driven dialog, which is where we process what the user says, then classify this into an **intent**. An intent is basically an action a user is trying to perform. For instance, if the user says 'help', their intent is to get help. Intents our bot needs to identify include things like getting top news and searching for news, which we will handle later. 

To start off simple, we'll be using keywords to identify intents. Let's initialise our intents dialog. Modify the code under Bots Dialogs in app.js so it looks like this:

```js
//=========================================================
// Bots Dialogs
//=========================================================

var intentDialog = new builder.IntentDialog();
// Check if the user said hi or hello
// This regex checks for the exact word
intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));

// This is called the root dialog. It is the first point of entry for any message the bot receives
bot.dialog('/', intentDialog);

// The dialog for our bot to say hello
bot.dialog('/sayHi', [
    function (session){
        // End dialog returns control back to the parent dialog after (optionally) sending a message
        session.endDialog("Hello, I'm Articles. Good to see you!");
    }
]);
```
**What exactly is happening here?** 

When the user sends a message, the root dialog receives it first. The root dialog then "passes" it to the intentDialog, which does a check to try and determine the intent. The intentDialog uses [regexes](http://www.w3schools.com/jsref/jsref_obj_regexp.asp) to do keyword matching. If it can't find an intent to match the user's message with, then it goes into onDefault. So in our case, the intentDialog will try to see if the user has said either 'hi', 'hello', etc. If yes, then it routes to the '/sayHi' dialog, which handles the bot's reply. 

**Why'd you use session.endDialog instead of session.send?** 

If we used session.send, it would send the hello message but still remain stuck in the '/sayHi' dialog. This would result in it replying with the hello message to anything the user says after that, which is not what we want. After the bot says hi, we want to return control to the root ('/') dialog, and appropriately process the user's next message. By using session.endDialog, we can end the '/sayHi' dialog with the hello message, and return control to the root dialog. 

Now, run your bot in the command prompt (`node app.js` in case you forgot) and talk to it in the emulator. It should only reply with the hello message if you say any of the keywords, and reply with the default message for anything else. Let's make the bot respond to 'help'. Modify the code as follows:

```js
//=========================================================
// Bots Dialogs
//=========================================================

var intentDialog = new builder.IntentDialog();
// Check if the user said hi or hello
// This regex checks for the exact word
intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
    .matches(/\b(help)\b/i, '/help')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));

// This is called the root dialog. It is the first point of entry for any message the bot receives
bot.dialog('/', intentDialog);

// The dialog for our bot to say hello
bot.dialog('/sayHi', [
    function (session){
        session.endDialog("Hello, I'm Articles. Good to see you!");
    }
]);

// The dialog for our bot to offer help
bot.dialog('/help', [
    function (session){
        session.endDialog("Global commands that are available anytime:\n\n* menu - Return to the menu anytime.\n* top - Get top news.\n* search - Search news.\n* trends - Get trending topics\n* help - Displays these commands.");
    }
]);
```

Run it, and you'll find that you can now use the 'help' keyword too.

###Sending attachments to the user

Text isn't the only thing you can send to your user via chat - you can send images and fancy schmancy cards as well. Note that while Facebook Messenger supports card attachments, not all chat platforms (e.g. Telegram) do so you'll have to check their documentation. 

Let's try creating a menu in the form of a card with an image and buttons. Modify the intentDialog.matches line to look like this:

```js
intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
    .matches(/\b(help)\b/i, '/help')
    .matches(/\b(menu)\b/i, '/menu')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));
```

And then add this dialog at the end:

```js
bot.dialog('/menu', [
    function (session) {
        //Create a message to be sent
        msg = new builder.Message(session)
            .attachments([
                // Create a card attachment
                new builder.HeroCard(session)
                    .title("Main Menu")
                    .subtitle("What would you like to do next?")
                    .images([
                        //Using this image: http://imgur.com/a/vl59A
                        builder.CardImage.create(session, "http://i.imgur.com/I3fYOM2.jpg")
                    ])
                    .buttons([
                        // Pressing these buttons will carry out dialog actions
                        builder.CardAction.dialogAction(session, "topnews", null, "Top News"),
                        builder.CardAction.dialogAction(session, "searchnews", null, "Search News"),
                        builder.CardAction.dialogAction(session, "trending", null, "Get Trending")
                    ])
            ]);
        session.endDialog(msg);
    }
]);
```

Run it, and when you type menu the bot should reply with a card that has an image and buttons. None of the buttons will work as they don't route to anything at the moment. Not to worry, we will remedy that soon.

###Multi-step Dialogs

We're moving on to more complex stuff now. Let's try fetching top news based on category.

**But what are we using to get the news?**

We're gonna go to CNN and copy paste the headlines manually into our bot. Just kidding. We'll be using the [Bing News API](https://www.microsoft.com/cognitive-services/en-us/bing-news-search-api). We can use it to get top news by categories, search the news, and get trending topics. I highly suggest briefly looking through the following links to familiarise yourself with the API:

- [Endpoints and examples of requests and responses](https://msdn.microsoft.com/en-us/library/dn760783.aspx)
- [Parameters for requests](https://msdn.microsoft.com/en-us/library/dn760793(v=bsynd.50).aspx)

To start using the Bing News API, we will need a subscription key (it's free don't worry). Go to the Microsoft Cognitive Services [webpage](https://www.microsoft.com/cognitive-services/) and click on 'My account' at the top right corner. Sign in to your Microsoft account/Sign up if you don't already have one. Click 'Yes' when you get to the screen with 'Let this app access your info'. You'll be taken to a page where you can request trials for various APIs. Scroll down to Bing Search - Free and then hit Subscribe. 

Now that you have your subscription key (you can use either key 1 or key 2, it doesn't matter), you can go to the [API testing console](https://dev.cognitive.microsoft.com/docs/services/56b43f72cf5ff8098cef380a/operations/56f02400dbe2d91900c68553) and play around with the API if you'd like. Try sending some requests and see the responses you get. [Here](https://msdn.microsoft.com/en-us/library/dn760793(v=bsynd.50).aspx#categoriesbymarket) are all the possible categories for Category News by the way. 

**Ok cool, now how do we link the news to the bot?**

Let's start off by getting the bot to understand us when we type 'top news'. Modify the intentsDialog.matches line to this:

```js
intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
    .matches(/\b(help)\b/i, '/help')
    .matches(/\b(menu)\b/i, '/menu')
    .matches(/\b(top news)\b/i, '/topNews')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));
```

Then add this snippet of code at the end to create a dialog for top news:

```js
bot.dialog('/topNews', [
    function (session){
        // Ask the user which category they would like
        // Choices are separated by |
        builder.Prompts.choice(session, "Which category would you like?", "Technology|Science|Sports|Business|Entertainment|Politics|Health|World|(quit)");
    }, function (session, results){
        var userResponse = results.response.entity;
        session.endDialog("You selected: " + userResponse);
    }
]);
```

**Not 1... But 2 functions in a dialog!?**

Yup. It's natural for a dialog to go back and forth, and so BotBuilder allows us the flexibility to have dialogs with multiple steps. This is called a [Waterfall](https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall). In this case, we use a [Prompt](https://docs.botframework.com/en-us/node/builder/chat/prompts) to present some choices to the user. Once the user selects a choice, we advance to the next step of the waterfall. The user's response from the previous step is also passed on. Run it and give it a go.

Let's go ahead and change the logic in the second step of the waterfall. Modify '/topNews' to the following:

```js
bot.dialog('/topNews', [
    function (session){
        // Ask the user which category they would like
        // Choices are separated by |
        builder.Prompts.choice(session, "Which category would you like?", "Technology|Science|Sports|Business|Entertainment|Politics|Health|World|(quit)");
    }, function (session, results){
        if (results.response && results.response.entity !== '(quit)') {
            //Show user that we're processing their request by sending the typing indicator
            session.sendTyping();
            // Build the url we'll be calling to get top news
            var url = "https://api.cognitive.microsoft.com/bing/v5.0/news/?" 
                + "category=" + results.response.entity + "&count=10&mkt=en-US&originalImg=true";
            session.endDialog("Url built.");
        } else {
            session.endDialog("Ok. Mission Aborted.");
        }
    }
]);
```

Here, we've handled if the user decides to quit the prompt. In terms of the url's parameters, we've only used a few parameters, but you can see a list of all parameters [here](https://msdn.microsoft.com/en-us/library/dn760793(v=bsynd.50).aspx#Anchor_2). Here is a brief explanation of the paramters we've used:

- **category** = the category we want news about.
- **count** = the number of news articles we want the API to return. I highly recommend returning 10 as 10 is the maximum number of cards that Messenger allows you to display at once.
- **mkt** = the language/country we want news from (only UK and US available at the moment).
- **originalImg** = whether we want the API to return the original image url with the article. I highly recommend setting this to true, otherwise the API returns thumbnails instead which translates to very low image quality.

**How do we make the actual API call?**

Not with a cellphone. We'll be using a Node package called [request-promise](https://www.npmjs.com/package/request-promise). Have a read of their [documentation](https://github.com/request/request-promise) and see how it is used to make API calls. Install the package by running the following command into the command prompt:

```shell
npm install --save request-promise
```

Now let's add a reference to request-promise into our bot. Add it to the top where we reference other modules, like this:

```js
var restify = require('restify');
var builder = require('botbuilder');
var rp = require('request-promise');
```

Under that, let's declare the Bing News Subscription Key which we will need to add in the header of the request:

```js
...
var rp = require('request-promise');

// Static variables that we can use anywhere in app.js
var BINGNEWSKEY = '*****YOUR SUBSCRIPTION KEY GOES HERE*****';
...
```

Note that for security reasons it's generally not advisable to paste any keys, passwords or sensitive stuff in your code - for now we're just doing it for the sake of simplicity. You can use [environment variables](https://blogs.msdn.microsoft.com/stuartleeks/2015/08/10/azure-api-apps-configuration-with-environment-variables/) as a way to keep the sensitive stuff away from the code - I'll add an extra section later showing you how to do this. 

With that, we can start calling the API. Modify '/topNews' to the following:

```js
bot.dialog('/topnews', [
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
                    'Ocp-Apim-Subscription-Key': BINGNEWSKEY
                },
                json: true // Returns the response in json
            }
            //Make the call
            rp(options).then(function (body){
                // The request is successful
                console.log(body); // Prints the body out to the console in json format
                session.send("Managed to get your news.");
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
```

If you run the bot now and choose a category, the API call is made and if you look at the command prompt, you should see the body of the response being printed. Have a look at it, and you'll find that all the articles are returned in the 'value' property of the body object. Let's now write a function that returns all the articles as a bunch of cards to the user. Add this function right below the topNews dialog - we'll call this function sendTopNews.

```js
bot.dialog('/topNews', [
    ...
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
                // Pressing this button fires off a dialog action called moredetails and attaches the description of the article as payload. This payload can be accessed by the dialog it gets forwarded to.
                builder.CardAction.dialogAction(session, "moredetails", article.description, "Short snippet"),
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
```

We only invoke this function when the API call is successful. Modify the part in the '/topNews' dialog where the request is being made to the following:

```js
bot.dialog('/topNews', [
    ...
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
    ...
]);
```

If you run the bot now and select a category, it'll send you a list of articles in the form of a carousel (bear in mind the request may take a while to complete). 

**Wait but, some of the buttons in the cards still don't work...**

You'll find that if you try to press on the 'Short snippet' button of a card, it doesn't work. This is because we haven't actually written the dialog action called moredetails yet. Let's do this.
Add these lines below the sendTopNews function:

```js
function sendTopNews(session, results, body){
    ...
}
// Whenever the 'moredetails' dialog action is called from somewhere, the /moreDetails dialog is started
bot.beginDialogAction('moredetails', '/moreDetails');

bot.dialog('/moreDetails', [
    function (session, args) {
        // Sends the forwarded payload (accessed through args)
        session.endDialog(args.data);
    }
]);
```

Ta-da, the 'Short snippet' button of an article card now works, and prints out a description of the article. You'll find that you can press on the 'Short snippet' button of any article at any time in the conversation and it'll send you the description. Now let's take care of the top news button in our menu in a similar way:

```js
bot.dialog('/menu', [
    ...
]);

// Whenever the 'topnews' dialog action is called from somewhere, the /topNews dialog is started
bot.beginDialogAction('topnews', '/topNews');
```

If you run your bot, the 'Top News' button on the menu now begins the '/topNews' dialog and prompts you for a category. You can also use keywords to trigger the dialogAction at any point in the conversation, e.g. `bot.beginDialogAction('help', '/help', { matches: /\b(help)\b/i });` means that you can type 'help' whenever to start the '/help' dialog, even if we aren't currently in the root dialog. Similarly, you can use keywords to end a conversation at any time e.g. `bot.endConversationAction('bye', '/sayBye', { matches: /\b(bye|see you)\b/i });`. 

**Whew! Now we just have search and trending to finish off.**

We've done the bulk of the hard stuff - retrieving and displaying search results and current trends are pretty similar to getting top news, except with different prompts and API calls. 

Let's begin with search. First, our bot needs to understand the term 'search', so let's add keyword detection. Modify intents.matches to this:

```js
intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
    .matches(/\b(help)\b/i, '/help')
    .matches(/\b(menu)\b/i, '/menu')
    .matches(/\b(top news)\b/i, '/topNews')
    .matches(/\b(search)\b/i, '/searchNews')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));
```

Now let's write the '/searchNews' dialog that it routes to. Add the following dialog at the bottom of app.js:

```js
bot.dialog('/moreDetails', [
    ...
]);

bot.dialog('/searchNews', [
    function (session){
        // Prompt the user for text input
        builder.Prompts.text(session, "Enter a topic you'd like news about: (or type 'quit' to cancel)");
    }, function (session, results, next){
        // The user gave us a search topic (i.e. they didn't say quit)
        // What the user entered is in results.response, which was passed on from the previous step of the waterfall
        if (results.response && results.response !== 'quit') {
            session.sendTyping();
            var url = "https://api.cognitive.microsoft.com/bing/v5.0/news/search?q="
            + results.response + "&count=10&mkt=en-US&originalImg=true";
            //Options for the request
            var options = {
                uri: url,
                headers: {
                    'Ocp-Apim-Subscription-Key': BINGNEWSKEY
                },
                json: true
            }
            //Make the request
            rp(options).then(function (body){
                sendSearchNewsResults(session, results, body);
            }).catch(function (err){
                console.log(err.message);  
                session.send("Argh, something went wrong. :( Try again?");
            }).finally(function () {
                session.endDialog();
            });
        } else {
            session.endDialog("Ok. Mission Aborted.");
        }
    }
]);
```

Pretty similar to the topNews dialog, eh? It won't work yet if you run it because we haven't coded up the sendSearchNewsResults function yet. Add this below the searchNews dialog:

```js
bot.dialog('/searchNews', [
    ...
]);

function sendSearchNewsResults(session, results, body){
    session.send("Top news about " + results.response + ": ");
    session.sendTyping();
    var allArticles = body.value;
    var cards = [];
    // Some searches don't return 10
    for (var i = 0; i < allArticles.length; i++){
        var article = allArticles[i];
        var cardImg;
        // Some search articles don't have images, so we need to check for that
        if (article.image) {
            // If there is an image provided with the article, then use the image
            cardImg = article.image.contentUrl;
        } else {
            // If there's no image provided with the article, use a default one
            cardImg = "http://i.imgur.com/7kYV6y5.jpg";
        }
        // Create a card for the article
        cards.push(new builder.HeroCard(session)
            .title(article.name)
            .subtitle(article.datePublished)
            .images([
                builder.CardImage.create(session, cardImg)
            ])
            .buttons([
                builder.CardAction.dialogAction(session, "moredetails", article.description, "Short snippet"),
                builder.CardAction.openUrl(session, article.url, "Full article")
            ]));
    }
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);
    session.send(msg);
}
```

See - just some small differences from the sendTopNews function, as well as checking if the article returned from the news search API has an image. If you run that, it should all be working. We'll also need to take care of the 'Search News' button in the menu. Add the beginDialogAction for searchnews like this:

```js
// Whenever the 'topnews' dialog action is called from somewhere, the /topNews dialog is started
bot.beginDialogAction('topnews', '/topNews');
bot.beginDialogAction('searchnews', '/searchNews');
```

Lastly, we need to get trending topics. Try looking at the API and figure this one out yourself, and come back if you get stuck. 

**Ok now show me how.** 

Oh wow that rhymed. Alright so same old same old, add the keyword detection for trends:

```js
intentDialog.matches(/\b(hi|hello|hey|howdy)\b/i, '/sayHi')
    .matches(/\b(help)\b/i, '/help')
    .matches(/\b(menu)\b/i, '/menu')
    .matches(/\b(top news)\b/i, '/topNews')
    .matches(/\b(search)\b/i, '/searchNews')
    .matches(/\W(trend)\W*/i, '/trending')
    .onDefault(builder.DialogAction.send("Sorry, I didn't understand what you said."));
```

I used a different kind of regex here, which is `/\W(trend)\W*/i`. This detects for any word that starts with trend, so words like 'trends' and 'trending' will also be matched. Feel free to play around with the regexes to best capture the user's intent. You can use this [nifty tool](https://regex101.com/) to test out your regexes.

Next up - writing the '/trending' dialog. For trending topics, we don't actually need to prompt the user for anything. Add this to the end of app.js:

```js
bot.dialog('/trending', [
    function (session){
        session.sendTyping();
        var url = "https://api.cognitive.microsoft.com/bing/v5.0/news/trendingtopics?mkt=en-US&count=10";
        //Options for the request
        var options = {
            uri: url,
            headers: {
                'Ocp-Apim-Subscription-Key': BINGNEWSKEY
            },
            json: true
        }
        //Make the request
        rp(options).then(function (body){
            sendTrending(session, body);
        }).catch(function (err){
            console.log(err.message);  
            session.send(prompts.msgError);
        }).finally(function (){
            session.endDialog();
        });       
    }
]);
```

And here's the sendTrending function that you can add below it:

```js
function sendTrending(session, body){
    session.send("Current trending topics:");
    session.sendTyping();
    var allArticles = body.value;
    var cards = [];
    for (var i = 0; i < 10; i++){
        var article = allArticles[i];
        // Create a card for the article
        cards.push(new builder.HeroCard(session)
            .title(article.name)
            .subtitle(article.query.text)
            .images([
                //handle if thumbnail is empty
                builder.CardImage.create(session, article.image.url)
            ])
            .buttons([
                builder.CardAction.openUrl(session, article.webSearchUrl, "Search on web")
            ])
        );
    }
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(cards);
    session.send(msg);
}
```

Just a catch though - the trending API only provides thumbnails as images (so it won't send you the original url of the image that the trend comes with). If you can't stand low res images plaguing your bot's experience then you can just remove it. Lastly, link the '/trending' dialog to the menu button like this:

```js
bot.beginDialogAction('topnews', '/topNews');
bot.beginDialogAction('searchnews', '/searchNews');
bot.beginDialogAction('trending', '/trending'); // Add this line
```

And we're done! You can see the full code [here](https://github.com/alyssaong1/NodeNewsBot). Note that in the code I have put the bot's speech, prompts and keywords into another file - this is optional but it does make the prompts easier to find and modify. It also keeps your code tidier and less lengthy.

Lastly, do note that this bot renders the news results only for Facebook Messenger at the moment. Microsoft Bot Framework makes it easy to deploy your bot onto any platform, but you need to be aware that not all messaging platforms (e.g. Kik, Telegram) will support the same attachments (e.g. most of them support sending text and image messages, but not cards). While the logic is the same (i.e. the API calls you make will not change across the bots), you'd have to check which messaging platform the user's message is coming from, then handling how your response is sent based on that. I may do a tutorial for this in future. 

