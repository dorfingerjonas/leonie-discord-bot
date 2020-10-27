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

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async msg => {
    if (!msg.author.bot) {
        try {
            const intentResponse = await detectIntent(projectId, sessionId, msg.content, languageCode);
            let responseText = intentResponse.queryResult.fulfillmentText;
            const placeholders = [
                {regEx: '$author', content: `<@${msg.author.id}>`},
                {regEx: '$hours', content: ('0' + new Date().getHours()).slice(-2)},
                {regEx: '$minutes', content: ('0' + new Date().getMinutes()).slice(-2)},
            ];

            for (const placeholder of placeholders) {
                while (responseText.includes(placeholder.regEx)) {
                    responseText = responseText.replace(placeholder.regEx, placeholder.content);
                }
            }

            msg.channel.send(responseText);
        } catch (error) {
            console.error(error);
        }
    }
});

client.login(token).catch(console.error);
