import { Client, GuildMember, Intents } from 'discord.js';
import { Log, SEVERITY } from './utils/logger';

import { Message } from './entities/Message';
import { Server } from './entities/Server';
import { Activity } from './entities/Activity';
import { User } from './entities/User';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

export const log = new Log(client, SEVERITY.DEBUG);

client.on('ready', async () => {
  try{
    setInterval(async () => {
      const guild = client.guilds.cache.find(guild => guild.name === 'NOVO MUNDO 新世界');
      const droppableMembers = await new Server(guild).getDroppableMembers();
      
      if(droppableMembers.length > 0){
        log.info(`Dropping ${droppableMembers.length} members`);
  
        droppableMembers.forEach(async (currentMember) => {
          const guildMemberList = await guild.members.fetch()
          const guildMember = guildMemberList.find(member => member.id === currentMember.id);
  
          if(guildMember){
            await new User(guildMember, guildMember.guild).dropUserRole();
          }else{
            log.error('Could not find member', { userName: currentMember.user, userId: currentMember.id });
          }
  
        });
      }
    }, 86400000);
  }catch(err){
    log.error('Something went wrong', { stack: err.stack });
  }
});

client.on('voiceStateUpdate', async (beforeState) => {
  try{
    const user = new User(beforeState.member, beforeState.member.guild);
    const server = new Server(beforeState.member.guild);
    const hasUpdatedActivity = await new Activity(server, user).setUserActivity();
    if(hasUpdatedActivity){
      log.info('The user activity was successfully updated', { userName: user.member.user.username, userId: user.member.user.id });
    }
  }catch(err){
    log.error('Something went wrong', { stack: err.stack });
  }
});

client.on('messageCreate', async (message) => {
  try{
    if(message.author.bot) return;
  
    const guild = client.guilds.cache.find(guild => guild.name === 'NOVO MUNDO 新世界');
    const guildMemberList = await guild.members.fetch()
    
  
    if (message.content.trim() === '--manage-roles') {
      
      await new Message(message.channel).sendRoleSwitcherMessage(guildMemberList)
      
    }
  }catch(err){
    log.error('Something went wrong', { stack: err.stack });
  }
});

client.on('interactionCreate', async interaction => {

  if (!interaction.isButton()) return;
  
  interaction.deferReply({ ephemeral: true })
              .then(console.log)
              .catch(console.error);

  try{
    const guild = client.guilds.cache.find(guild => guild.name === 'NOVO MUNDO 新世界');
    const guildMemberList = await guild.members.fetch()
    const guildMember = guildMemberList.find(member => member.id === interaction.message.embeds[0].author.name);
    if(guildMember){
      await new User(guildMember, guildMember.guild).setUserRoleByName(interaction.member as GuildMember, interaction.customId);
      interaction.editReply('Role successfully updated');
    }else{
      log.error('Could not find member', { userName: interaction.member.user.username, userId: interaction.member.user.id });
    }
  }catch(err){
    if(err.message === 'NotPaulo'){
      interaction.editReply({
        content: 'Você não é o Paulo, sua puta.',
        files: ['https://wallpaper.dog/large/304742.jpg']
      });
    }else{
      log.error('Something went wrong', { stack: err.stack });
    }
  }
});

export const bot = client;