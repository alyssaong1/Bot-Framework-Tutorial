#BONUS MISSION: Connecting the bot to messaging channels

Now that our bot works locally, we are going to link it to the Bot Connector so that we can connect it to channels like Skype and Facebook Messenger.

####Do the following to begin with:
- Install [git](https://git-scm.com/downloads)
- Make a Microsoft account if you don't have one
- Make a Github account if you don't have one

##Initialise a Github repository

A Github repository is a great way to store your code online and collaborate with others on a codebase. You can plug your repository in to a hosted web app and each time you make changes to the repository, the changes automatically deploy onto your web app (this is called Continuous Integration). Log in to [Github](http://github.com). Click on the + sign at the top right hand corner, and then click on New Repository. Name your repository, click on Add .gitignore, and type in Node. Create the repository. Once that's created, click on the Code tab of your repository. Click on the green "Clone or download" button, then copy the url (it should end with .git). 

Now, we need to make the current folder containing your bot a Git repository. In the command prompt, navigate to the folder containing your bot. Then, let's initialise the folder as a git repository using this command:

```shell
git init
```

We now need to link our local Git folder to the remote Github repository. Type in the following command:

```shell
git remote add origin https://github.com/yourusername/yourrepositoryname.git
```

Make sure you use the url you copied earlier in the above command. Your local Git repository is now remotely tracking your Github repository online. Type `git remote -v` to check that it points to the correct url. Let's pull our remote Github repo, using this command:

```shell
git pull origin master
```

Once that's done, let's commit and push our code to the Github repo. Run the following commands (separately):

```shell
git add .
git commit -m "Initial commit"
git push origin master
```

If you refresh your Github repository online, you should see that your code has been pushed to it. Now let's use continuous integration to deploy the code in our Github repo into a web app hosted online. 

##Set the start command

In your package.json file (if you're using nodejs), we need to update the start script. Update your package.json file to the following:

```js
{
    ...
    "main": "app.js",
    "scripts": {
        "start": "node index.js" // tells the web service where the start script is
    },
    "author": "Alyssa Ong",
    ...
}
```

This step is very important - your bot service may not work if you do not do this.

##Publish the bot online

We have to publish the bot online as the Bot Framework won't be able to talk to a local url. 

Go to the [Azure Portal](https://portal.azure.com). Click on 'New' (it's at the sidebar), go into the web + mobile tab, and click on Web App. Name your web app whatever you'd like, name your resource group something sensible. Your Subscription should be free, and the location your app is hosted on can be anywhere, but it might be good to set it to a region close to you. Go ahead and create your web app.

It might take a while, but you will get notified when your web app has been successfully created. Once it has been created go into All Resources (it's on the sidebar) and look for the web app you just created. Click into it and it should display a dashboard with info about your web app. Click into the Github blade under Choose Source. Then, click into Authorization and log in with your Github credentials. Then, select the project and branch (should be master) that your bot is in. Leave the Performance Test as not configured and hit ok. 

![CI](https://raw.githubusercontent.com/alyssaong1/HOL-NUSHackathon/master/Images/Bonus/cintegration.PNG)

It may take a while for the latest commit to sync and be deployed to your web app. If the latest commit doesn't seem to be syncing, just hit sync. You'll see a green tick with your latest commit once it's done. 

![CISuccess](https://raw.githubusercontent.com/alyssaong1/HOL-NUSHackathon/master/Images/Bonus/cintsuccess.PNG)

##Registering your bot on the portal

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
By default, the Skype and Web Chat channels should already be setup for you. Try adding the Bot as a Skype contact and start talking to it.

## Common issues
If your test returns an authentication/authorization error, chances are that the Microsoft App ID and Password that you registered on the portal has not been configured on your bot's server.

If the AppID and Password are set using environment variables in your Node.js code, you can input the credentials into your Azure Web App application settings.