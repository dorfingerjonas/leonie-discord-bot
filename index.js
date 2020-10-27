const Discord = require('discord.js');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const token = require('./auth').token;

const client = new Discord.Client();
const projectId = 'leonie-jmys';
const sessionId = uuid.v4();
const languageCode = 'en';

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'GoogleApiKey.json';

const sessionClient = new dialogflow.SessionsClient();

executeQuery("Hallo Leonie!");

async function detectIntent(projectId, sessionId, query, languageCode) {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function executeQuery(query) {
    try {
        console.log(`Sending Query: ${query}`);
        const intentResponse = await detectIntent(projectId, sessionId, query, languageCode);
        console.log('Detected intent')
        console.log(intentResponse.queryResult.fulfillmentText);
    } catch (error) {
        console.error(error);
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    console.log(msg.content);
});

client.login(token).catch(console.error);
