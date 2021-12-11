import { Client, Intents } from 'discord.js';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
})

client.on('ready', () => {
  console.log(`${client.user.tag} is ready.`);
})

client.on('voiceStateUpdate', ({...rest}) => {
  console.log(rest)
})

export const bot = client;