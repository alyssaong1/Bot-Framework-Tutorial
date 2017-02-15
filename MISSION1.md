#Setting up the bot with Microsoft Bot Framework

This part has been largely based off the setup documented by Microsoft [here](https://docs.botframework.com/en-us/node/builder/overview/#navtitle), but I've added a bit more detail. 

####First of all, go and install these:
- [NodeJS](https://nodejs.org/en/). After you've installed this, open your command line and run `npm install npm -g`. This updates Node's Package Manager (npm) to the latest version.
- [Visual Studio Code](https://code.visualstudio.com/) (or any other code editor of your choice)

Make a new folder for your bot. All your bot's code will be stored in this folder. Next, open up your command prompt and navigate to your bot's folder using cd. Refer to [this link](http://www.wikihow.com/Change-Directories-in-Command-Prompt) if you're not sure how to do this. Mine ends up looking something like this:

<insert img>

Now run `npm init` to start your nodejs project. They'll fill in some fields for you by default, you can keep pressing enter. You can enter the description for your bot and author name (as I have done) if you'd like, but it's ok to leave them blank too. 

<insert img>

If you check your bot's folder now, there should be a package.json file. [package.json](https://docs.npmjs.com/files/package.json) is like a description of the project, such as which packages our node project uses. It does other useful stuff too that we don't need for this tutorial. Now run the following 2 commands separately in the command line to install the botbuilder and restify packages (each of the packages may take a while to finish installing):

```shell
npm install --save botbuilder@3.6.0
npm install --save restify@4.3.0
```

Packages (or dependencies) are like parts/modules that others have written which we can use to build our bot. Microsoft's [BotBuilder](https://www.npmjs.com/package/botbuilder) is a framework we use to build our bot by handling stuff such as dialogs and storing info about the user. [Restify](https://www.npmjs.com/package/restify) exposes our bot through an API so that other web services can talk to it. The `--save` flag automatically updates the package.json file to show that BotBuilder and Restify are dependencies in our project.

Open up Visual Studio Code. Go to File > Open Folder... and select your bot's folder. You should be able to see your file structure on the left panel, it'll look something like this:

<insert img>

 The node_modules folder contains all the packages needed in our project. If you look into the folder, you'll see more than just BotBuilder and Restify - that's because they require other packages to work as well. Right click the left panel area and create a new file. Name it 'server.js'.
 
 Now copy and paste the following snippet of code into server.js:

```js
// Reference the packages we require so that we can use them in creating the bot
var restify = require('restify');
var builder = require('botbuilder');

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

// This is called the root dialog. It is the first point of entry for any message the bot receives
bot.dialog('/', function (session) {
    // Send 'hello world' to the user
    session.send("Hello World");
});
```

I've inserted comments to explain the code. At the moment, the bot sends "Hello World" to the user every time it receives a message. To talk to our bot, we will use the [Bot Framework Emulator](https://docs.botframework.com/en-us/tools/bot-framework-emulator/). Install it straight from [here](https://emulator.botframework.com). 

Once you've installed the emulator, let's get talking to our bot. Go back to the command prompt or Integrated Terminal (in VSCode under View) and run `node server.js`. This basically runs the server.js file, which is the starting point of our bot. It may take a while to fire up, and it will look like this once it's done:  

![node server.js pic](/Images/Mission1/serverjs_cmdline.png)

Open the Bot Framework Emulator. You should see some text fields at the top. Local Port should be 9000, Emulator Url should be http://localhost:9000/ and Bot Url should be http://localhost:3978/api/messages. Here, our emulator is sending Post requests from port 9000 of our local server, to /api/messages on port 3978 of our local server (use whatever port your server is using). Leave the Microsoft App Id and Microsoft App Password fields blank for now.

Go ahead and type a message in the chatbox at the bottom and send it. The bot should respond 'Hello World' every time you send it a message. If you look back at the command line, you'll be able to see some info on what's being called. Note that if there are any errors, you'll be able to see the error in the command line as well which helps with debugging. Press `Ctrl + c` in the command line when you're done talking to the bot. 

Congratulations, you've finished Mission 1! 
