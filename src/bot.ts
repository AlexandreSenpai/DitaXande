import { Client, Intents } from 'discord.js';
import { ChangeMemberActivity } from './actions/changeMemberActivity';

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

client.on('voiceStateUpdate', (beforeState) => {
  new ChangeMemberActivity().setActivityTimestamp(beforeState)
})

export const bot = client;