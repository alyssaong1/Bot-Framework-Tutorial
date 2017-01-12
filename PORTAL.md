# Bot Framework Portal

## Registering a new bot

In order for your bot to talk to the Bot Connector and reach your users on the different channels, the bot has to be first registered on the Bot Framework portal. 

First, go to this link on your browser: https://dev.botframework.com/bots/new

You will be prompted to sign in with your Microsoft account. Take note to use a personal Microsoft account (usually Hotmail, Outlook, MSN, Live email addresses) and not your school or organization's Office365 account.

After signing in, you will be greeted with a simple form that allows you to register your bot. Most of the fields are self-explanatory. 
- The "Messaging Endpoint" field should be filled with the domain given to you on your Azure Web App, but subdomain to /api/messages.
- The "Create Microsoft App ID and Password" button will open a new page which you can come back from afterwards.
- You can also input your Azure Application Insights key if you enabled it when creating the Web App on Azure, but it's optional.

![Registration](https://raw.githubusercontent.com/alyssaong1/HOL-NUSHackathon/master/Images/Portal/Registration.PNG)

## Managing your new bot
After registering, you'll be sent to the page where you can manage all your bots. Click on the bot you just created. The page should look like this:

![Management](https://raw.githubusercontent.com/alyssaong1/HOL-NUSHackathon/master/Images/Portal/Management.PNG)

The top portion has several useful functions.
- A testing function which will send a simple HTTP request to your messaging endpoint and give you back an appropriate success or error message.
- The Web Chat (iframe) channel that has been pre-embedded for you on the page, allowing you to talk to your bot from the portal

The most important part is the bottom portion, where you will be able to go through a simple set of steps to connect to different channels like Facebook, Telegram, etc.
By default, the Skype and Web Chat channels should already be setup for you. 

## Common issues
If your test returns an authentication/authorization error, chances are that the Microsoft App ID and Password that you registered on the portal has not been configured on your bot's server.

If the AppID and Password are set using environment variables in your Node.js code, you can input the credentials into your Azure Web App application settings.