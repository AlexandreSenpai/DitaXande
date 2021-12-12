import { Client, Intents } from 'discord.js';
import { database } from './database';
import { Member } from './database/models/member.entity';
import { ChangeRole } from './actions/changeRole';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
})

client.on('ready', async () => {
})

client.on('voiceStateUpdate', ({...rest}) => {
  console.log(rest)
})

export const bot = client;