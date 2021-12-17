import { database } from '../../database'
import { Member } from '../../database/models/member.entity'
import { Server } from '../Server'
import { User } from '../User'

export class Activity{

    private guild: Server
    private member: User

    constructor(server: Server, user: User){
        this.guild = server
        this.member = user
    }

    public async setUserActivityTimestampOnDatabase(){
        const lastActivity = new Date()
        const member: Member = await database.client.read_doc('members', this.member.member.id)
        const updatedMember: Member = {
            ...member,
            tracking: {
                last_activity: lastActivity.getTime(),
                drop_timestamp: lastActivity.setDate(lastActivity.getDate() + 7)
            }
        }
        await database.client.update_doc('members', this.member.member.id, updatedMember)
    }
    
    public async setUserActivity(): Promise<boolean>{
        const onlineMembers = await this.guild.getActiveMembersFromVoiceChannel()
        const stillOnline = this.guild.checkIfMemberStillActiveOnVoiceChannel(onlineMembers, this.member.member)

        if(!stillOnline){
            await this.setUserActivityTimestampOnDatabase()
            return true
        }
        return false
    }
}
