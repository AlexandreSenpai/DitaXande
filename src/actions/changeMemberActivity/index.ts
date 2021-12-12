import { VoiceState, VoiceChannel, GuildMember, Guild } from 'discord.js'
import { Member } from '../../database/models/member.entity'
import { database } from '../../database'

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

    async setActivityTimestamp(voiceState: VoiceState){
        const onlineMembers = this.getOnlineMembersFromVoiceChannelFromGuild(voiceState.guild)
        const changedMember = voiceState.member
        const stillOnline = this.checkIfMemberStillOnline(onlineMembers, changedMember)

        if(!stillOnline){
            const lastActivity = new Date()
            const member: Member = await database.client.read_doc('members', changedMember.id)
            const updatedMember: Member = {
                ...member,
                tracking: {
                    last_activity: lastActivity.getTime(),
                    drop_timestamp: lastActivity.setDate(lastActivity.getDate() + 3)
                }
            }
            await database.client.update_doc('members', changedMember.id, updatedMember)
        }
    }
}
