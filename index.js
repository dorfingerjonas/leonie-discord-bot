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
    if (msg.content.toLowerCase().startsWith('!leonie')) {
        const command = msg.content.toLowerCase().split('!leonie ')[1];

        switch (command) {
            case 'hilfe':
                help(msg);
                break;
            case 'tipps':
                tipps(msg);
                break;
            default:
                fallback(msg);
                break;
        }
    } else if (!msg.author.bot) {
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

            msg.channel.send(responseText).catch(console.error);
        } catch (error) {
            console.error(error);
        }
    }
});

function help(msg) {
    const help = '`!leonie tipps`: Zeigt Tipps für Unterhaltungen und Fragen an \n' +
        '`!leonie hilfe`: Zeigt Hilfestellungen an \n';

    const embed = new Discord.MessageEmbed()
        .setColor('#fcbb4f')
        .setAuthor('Leonie', 'https://cdn.discordapp.com/app-icons/770211066452901928/0c075cbaf493b71b20d23aae8483f4d3.png?size=256')
        .addField('Hilfe', help);

    msg.channel.send(embed).catch(console.error);
}

function tipps(msg) {
    const help = 'Frag mich Sachen über die HTL Leonding: z.B. ' +
        '\n - "Erzähl mir was zur HTL Leonding" ' +
        '\n - "Was sind die Berufschancen nach der HTL Leonding?"  ' +
        '\n - ... \n' +
        'Du kannst auch Fragen über mich stellen: z.B. ' +
        '\n - "Wer hat dich erschaffen" ' +
        '\n - "Wie alt bist du" ' +
        '\n - "Was kann Leonie" ' +
        '\n - ... \n' +
        'Am Besten du schreibst mir einfach und dann wirst du mit der Zeit auch lustige Seiten von mir kennenlernen.';

    const embed = new Discord.MessageEmbed()
        .setColor('#fcbb4f')
        .setAuthor('Leonie', 'https://cdn.discordapp.com/app-icons/770211066452901928/0c075cbaf493b71b20d23aae8483f4d3.png?size=256')
        .addField('Tipps', help);

    msg.channel.send(embed).catch(console.error);
}

function fallback(msg) {
    msg.channel.send('Ich kenne diesen Befehl leider nicht.').catch(console.error);
}

client.login(token).catch(console.error);
