# Language Understanding Intelligent Service (LUIS)

## Natural Language
Bots often do not just take binary inputs. Users rarely type in the exact way you want them to, which often makes direct string comparison difficult. The solution is to use LUIS.AI to understand natural language.

## Intents and Entities
LUIS allows us to detect what the user wants based on the sentence they send, which is often known as an "intent". Sometimes we want to parse the actionable information within the sentence, which is often known as "entities". We can then execute logic or send back messages depending on the intent and entities in the sentence.

For example, let's say a user says "What's the news in `Paris` on `Thursday`?". Using LUIS, we can tell that the intent is to "GetNews" while the entities are location ("Paris") and date ("Thursday"). This allows the program to know that the user wants to find news at the location and date specified.

## Activating LUIS
First, login to [LUIS.AI](LUIS.AI) using your personal Microsoft account. 

Hover over your name on the top right and click Settings. Go to the "Subscription Keys" tab where you can enter the subscription key you generated on Azure.

## Making a new LUIS app
Go back to the [LUIS.AI](LUIS.AI) page and click Create New Application.

Fill up the form:
- Name can be set to anything you want
- Set application usage scenario to Bots
- Set domain to anything you want
- Click Add Application

## Adding intents and entities
After clicking your LUIS app, you should be directed to a page. The left sidebar allows us to add new intents and entities. 

![LUIS UI](https://raw.githubusercontent.com/alyssaong1/HOL-NUSHackathon/master/Images/Luis/LUIS.PNG)

### Making a new entity
Let's first add a new entity called "Location" by clicking the plus button.

![NewEntity](https://raw.githubusercontent.com/alyssaong1/HOL-NUSHackathon/master/Images/Luis/NewEntity.PNG)

### Making a new intent
The default intent is "None", which will be used whenever no intent is detected from a user's sentence.

We can use the + button to add a new intent. Let's add "GetNews" for now. As an example utterance, write "Give me the news in Singapore".

![NewIntent](https://raw.githubusercontent.com/alyssaong1/HOL-NUSHackathon/master/Images/Luis/NewIntent.PNG)

After clicking save, we will be able to label the entity in the utterance. Simply highlight the word "Singapore" and select the Location entity for it.

![NewIntentLabel](https://raw.githubusercontent.com/alyssaong1/HOL-NUSHackathon/master/Images/Luis/NewIntentLabel.PNG)

When you're done, click submit.

## More utterances
In order for LUIS to perform better, you need to give it more examples of an intent.

Let's add another utterance saying "Get me the news in Paris please".


## Connecting LUIS to your bot