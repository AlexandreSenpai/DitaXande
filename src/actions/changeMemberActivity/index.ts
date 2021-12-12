import { VoiceState, VoiceChannel, GuildMember, Guild } from 'discord.js'

export class ChangeMemberActivity{
    getOnlineMembersFromVoiceChannelFromGuild(guild: Guild): Array<GuildMember> {
        let members = []
        
        guild.channels.cache.forEach((channel: VoiceChannel) => {
            if(channel.type === 'GUILD_VOICE'){
                channel.members.forEach(member => {
                    members.push(member)
                })
            }
        })

        return members
    }

    checkIfMemberStillOnline(onlineMembers: Array<GuildMember>, changedMember: GuildMember): boolean {
        return onlineMembers.find(member => member.id === changedMember.id) !== undefined
    }

    setActivityTimestamp(voiceState: VoiceState){
        const onlineMembers = this.getOnlineMembersFromVoiceChannelFromGuild(voiceState.guild)
        const changedMember = voiceState.member

        const stillOnline = this.checkIfMemberStillOnline(onlineMembers, changedMember)

        if(stillOnline){
            console.log(`${changedMember.nickname} ainda está online.`);
        }else{
            console.log(`${changedMember.nickname} ainda ficou offline.`);
        }
    }
}
