import { Guild, GuildMember, Role } from 'discord.js'
import { log } from '../../bot';
import { database } from "../../database";
import { Member } from '../../database/models/member.entity';
import { Tier } from '../../database/models/tier.entity';
import { Activity } from '../Activity';
import { Server } from '../Server';

export class User {

    public member: GuildMember;
    public guild: Guild;
    public role: Role;

    constructor(member: GuildMember, guild: Guild) {
        this.member = member;
        this.guild = guild;
        this.role = this.getFirstValidMemberRole(member);
    }
    
    private getFirstValidMemberRole(member: GuildMember): Role | undefined {
        return member.roles.cache.find((role: Role) => role.mentionable)
    }

    private async updateDiscordRoleOnDatabase() {
        const tier: Tier = await database.client.read_doc('tiers', this.role.id);
        const member: Member = await database.client.read_doc('members', this.member.id);
        const updatedMember: Member = {
            ...member,
            role: {
                name: tier.name,
                tier: database.client.db.doc(`/tiers/${this.role.id}`)
            }
        }
        return database.client.update_doc('members', this.member.id, updatedMember);
    }

    private async getDiscordRoleInstance(roleId: string): Promise<Role> {
        const roles = await this.guild.roles.fetch();
        return roles.find(role => role.id === roleId);
    }

    private async getNextRoleInstance(): Promise<Role | undefined> {
        const currentRole: Tier = await database.client.read_doc('tiers', this.role.id);
        const nextRoleQuery = await database.client.get_collection('tiers')
                                            .where('position', '==', Number(currentRole.position) + 1)
                                            .get();
        
        if(!nextRoleQuery.empty) {
            const nextRole = nextRoleQuery.docs[0].data();
            return await this.getDiscordRoleInstance(nextRole.id);
        }
        
        return undefined;
    }

    private async roleSwitcher(member: GuildMember, oldRole: Role, newRole: Role): Promise<boolean> {
        try{
            if(oldRole instanceof Role && newRole instanceof Role) {
                await this.member.roles.add(newRole);
                await this.member.roles.remove(oldRole);
                return true
            }else{
                log.error('The role is not an instance of Role.', { oldRole: oldRole.name, newRole: newRole.name });
                return false
            }
        }catch(err){
            log.error('Error while switching roles', { error: err.message, user: member.user.username, userId: member.id });
            return false;
        }
    }

    public async dropUserRole(): Promise<boolean> {
        const nextRole = await this.getNextRoleInstance();
        log.info('Dropping user role', { user: this.member.user.username, userId: this.member.id, from: this.role.name, to: nextRole.name });
        if(nextRole) {
            await this.roleSwitcher(this.member, this.role, nextRole);
            log.info(`Role dropped successfully.`, { user: this.member.user.username, userId: this.member.id, from: this.role.name, to: nextRole.name });
            await this.updateDiscordRoleOnDatabase();
            this.role = nextRole;

            await new Activity(
                new Server(this.guild), 
                new User(this.member, this.guild)
            ).setUserActivityTimestampOnDatabase();

            return true;
        }else{
            console.debug(`There is no next role for ${this.member.user.username}`);
        }
        return false;
    }

    public async setUserRoleById(roleId: string): Promise<boolean> {
        const newRole = await this.getDiscordRoleInstance(roleId);
        if(newRole) {
            await this.roleSwitcher(this.member, this.role, newRole);
            this.role = newRole;
            
            const server = new Server(this.guild);
            const user = new User(this.member, this.guild);
            
            await new Activity(server, user).setUserActivityTimestampOnDatabase();
            log.info('The user activity was successfully updated', { userName: this.member.user.username, userId: this.member.user.id });
            
            await this.updateDiscordRoleOnDatabase();
            return true;
        }
        return false;
    }

    public async setUserRoleByName(requester: GuildMember, roleName: string): Promise<boolean> {
        const requesterMember: Member = await database.client.read_doc('members', requester.id);
        const requesterTier = await requesterMember.role.tier.get();

        if(requesterTier.data().type !== 'admin'){
            log.error('Requester doesn\'t have permissions to manage roles.', { requester: requester.user.username, requesterId: requester.id });
            return false;
        }

        const nextRoleQuery = await database.client.get_collection('tiers').where('name', '==', roleName.toLowerCase()).get();
        
        if(!nextRoleQuery.empty) {

            const role = nextRoleQuery.docs[0].data();
            const newRole = await this.getDiscordRoleInstance(role.id);

            if(newRole.name.toLowerCase() === 'lancelot' && this.member.id !== '309439384787353600') {
                throw new Error('NotPaulo');
            }

            log.info('Changing user role', { requester: requester.user.username, user: this.member.user.username, userId: this.member.id, from: this.role.name, to: newRole.name });

            await this.roleSwitcher(this.member, this.role, newRole);
            await this.updateDiscordRoleOnDatabase();
            
            log.info(`Role changed successfully.`, { requester: requester.user.username, user: this.member.user.username, userId: this.member.id, from: this.role.name, to: newRole.name });
            this.role = newRole;
            
            const server = new Server(this.guild);
            const user = new User(this.member, this.guild);

            await new Activity(server, user).setUserActivityTimestampOnDatabase();
            log.info('The user activity was successfully updated', { userName: this.member.user.username, userId: this.member.user.id });
            
            await this.updateDiscordRoleOnDatabase();
            return true;
        }

        return false;
    }
}