import { Guild, GuildMember, Role } from "discord.js";
import { database } from "../../database";
import { Tier } from '../../database/models/tier.entity';
import admin from "firebase-admin";
import { Member } from "../../database/models/member.entity";

export class ChangeRole {

    private member: GuildMember;
    private currentRoleId: string;
    private guild: Guild;
    
    constructor(member: GuildMember, guild: Guild) {
        this.member = member;
        this.guild = guild;
        this.currentRoleId = this.member.roles.cache.first().id;
    }

    private async updateDiscordRoleOnDatabase() {
        const tier: Tier = await database.client.read_doc('tiers', this.currentRoleId);
        const member: Member = await database.client.read_doc('members', this.member.id);
        const updatedMember: Member = {
            ...member,
            role: {
                name: tier.name,
                tier: database.client.db.doc(`/tiers/${this.currentRoleId}`)
            }
        }
        return database.client.update_doc('members', this.member.id, updatedMember);
    }

    private async getDiscordRoleInstance(roleId: string): Promise<Role> {
        const roles = await this.guild.roles.fetch();
        return roles.find(role => role.id === roleId);
    }

    private async getNextRoleInstance(): Promise<Role | undefined> {
        const currentRole: Tier = await database.client.read_doc('tiers', this.currentRoleId);
        const nextRoleQuery: admin.firestore.QuerySnapshot<admin.firestore.DocumentData> = 
            await database.client.get_collection('tiers').where('position', '==', Number(currentRole.position) + 1).get();
        
        if(!nextRoleQuery.empty) {
            const nextRole = nextRoleQuery.docs[0].data();
            return await this.getDiscordRoleInstance(nextRole.id);
        }
        
        return undefined;
    }

    public async setRole(): Promise<boolean> {
        const nextRole = await this.getNextRoleInstance();
        const currentRole = await this.getDiscordRoleInstance(this.currentRoleId);
        if(nextRole) {
            await this.member.roles.add(nextRole);
            await this.member.roles.remove(currentRole);
            this.currentRoleId = nextRole.id;
            await this.updateDiscordRoleOnDatabase();
            return true;
        }
        return false;
    }
}