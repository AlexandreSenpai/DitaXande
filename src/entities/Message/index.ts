import { Collection, DMChannel, GuildMember, MessageActionRow, MessageButton, MessageEmbed, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel } from "discord.js";
import { database } from '../../database'
import { Tier } from '../../database/models/tier.entity';

export class Message {

    private channel: DMChannel | PartialDMChannel | TextChannel | NewsChannel | ThreadChannel;

    constructor(channel: DMChannel | PartialDMChannel | TextChannel | NewsChannel | ThreadChannel) {
        this.channel = channel;
    }

    public async sendLogMessage(payload: { message: string, additionalInformation?: object, severity: number }): Promise<void> {

        const severityColors = {
            0: '#bde4ff',
            1: '#0099ff',
            2: '#ff9900',
            3: '#ff0000'
        }

        let description = ''
        if(payload.additionalInformation){
            Object.keys(payload.additionalInformation).forEach(key => {
                description += `**${key}**: ${payload.additionalInformation[key]}\n`
            })
        }

        const embed = new MessageEmbed().setColor(severityColors[payload.severity])
                                        .setTitle(payload.message)
                                        .setDescription(description)
        await this.channel.send({
            embeds: [embed],
            content: '\n'
        })
    }

    public async sendRoleSwitcherMessage(guildMembers: GuildMember[] | Collection<string, GuildMember>){
        const tiers = await database.client.get_collection('tiers').get();
        guildMembers.forEach(async (member: GuildMember) => {
            if(member.user.bot) return;

            const embed = new MessageEmbed().setColor('#0099ff')
                                            .setTitle(`Alterar cargo de: ${member.user.username}`)
                                            .setDescription(`User id: ${member.user.id}`)
                                            .setAuthor(member.id);
            const row = new MessageActionRow()
            
            const buttons = []
            for(const tier of tiers.docs){
                const tierDoc: Tier = await tier.data();
                buttons.push(new MessageButton().setCustomId(tierDoc.name)
                                                .setLabel(tierDoc.name)
                                                .setStyle('PRIMARY'))
            }
            await this.channel.send({
                components: [row.setComponents(buttons)],
                embeds: [embed],
                content: 'Escolha o cargo que deseja atribuir ao usuário'
            })
            
        })
    }

    public async sendStringMessage(message: string): Promise<void> {
        await this.channel.send(message);
    }

}