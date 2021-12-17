import { Guild, GuildMember } from "discord.js"
import { log } from "../../bot";
import { database } from "../../database";
import { Member } from "../../database/models/member.entity";
import { Tier } from "../../database/models/tier.entity";

export class Server {

    public guild: Guild;

    constructor(guild: Guild) {
        this.guild = guild
    }

    public async getActiveMembersFromVoiceChannel(): Promise<GuildMember[]> {
        const members = []
        
        const channels = await this.guild.channels.fetch()
        channels.forEach(channel => {
            if(channel.type === 'GUILD_VOICE'){
                channel.members.forEach(member => {
                    members.push(member)
                })
            }
        })

        return members
    }

    public checkIfMemberStillActiveOnVoiceChannel(onlineMembers: Array<GuildMember>, changedMember: GuildMember): boolean {
        return onlineMembers.find(member => member.id === changedMember.id) !== undefined
    }

    public async getDroppableMembers(): Promise<Member[]> {
        const docs = await database.client.get_collection('members').get()
        const dropableMembers: Member[] = await Promise.all(docs.docs.map(async doc => {
            const member: Member = doc.data()
            const tierDoc = await member.role.tier.get()
            const tier: Tier = tierDoc.data()
            if(tier){
                if(member.tracking.drop_timestamp <= new Date().getTime() && tier.position < 5) {
                    return member
                }
            }else{
                log.debug(`Tier ${tierDoc.id} not found for member ${member.id}`)
            }
            return undefined
        }))
        return dropableMembers.filter((member: Member) => member !== undefined)
    }
}