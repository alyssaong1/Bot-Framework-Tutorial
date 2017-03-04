# Challenge 2: Getting the weather
The goal of this mission is to give the bot the functionality of retrieving the weather on Earth.

## NPM installation
`dark-sky` is a useful npm that allows you to retrieve the weather from the Dark Sky API easily and simply.

Back in the command prompt (which should already be configured to your working directory), you can simply run this command to install the NPM:

```shell
npm install dark-sky --save
```

## Utilizing Dark Sky
Let's first start by importing the modules needed at the top of our main script and setup Dark Sky with an API key. You can your own API key from Dark Sky's website [here](https://darksky.net/dev/).

```js
var darksky = require('dark-sky');
var forecast = new DarkSky("api key here");
```

From there, you can use a few options to retrieve the weather: (you can set the latitude and longitude to whichever place you like)

```js
forecast
    .latitude('37.8267')            \\ required: latitude, string.
    .longitude('-122.423')          \\ required: longitude, string.
    .time('2016-01-28')             \\ optional: date, string 'YYYY-MM-DD'.
    .units('ca')                    \\ optional: units, string, refer to API documentation.
    .language('en')                 \\ optional: language, string, refer to API documentation.
    .exclude('minutely,daily')      \\ optional: exclude, string, refer to API documentation.
    .extendHourly(true)             \\ optional: extend, boolean, refer to API documentation.
    .get()                          \\ execute your get request.
    .then(res => {                  \\ handle your success response.
        console.log(res)
    })
    .catch(err => {                 \\ handle your error response.
        console.log(err)
    })
```

## Challenge
Now that we've setup the weather API, we can call it in the bot and display it to the user.

We have to make a new LUIS intent, as well as connect a new dialog to the intent. 
When the user asks for the weather we can then retrieve it and display it to them.

## Finishing Line
At the end, the bot should be able to tell the user the weather when prompted.