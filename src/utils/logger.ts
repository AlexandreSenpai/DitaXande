import { Client, TextChannel } from "discord.js";
import { Message } from '../entities/Message';

export enum SEVERITY {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3
}

export class Log {

    private client: Client;
    private severity: SEVERITY;

    constructor(client: Client, severity: SEVERITY){
        this.client = client;
        this.severity = severity;
    }

    private async sendToDiscord(payload: { message: string, additionalInformation?: object, logSeverity: number }): Promise<void> {
        if(payload.logSeverity >= this.severity) {
            const guilds = await this.client.guilds.fetch();
            const guildTarget = guilds.find(guild => guild.name === 'NOVO MUNDO 新世界');
            const guild = await guildTarget.fetch();
            const targetChannel = await guild.channels.fetch();
            const channel = targetChannel.find(channel => channel.name === 'pergaminho') as TextChannel;
            if(channel){
                await new Message(channel).sendLogMessage({
                    message: payload.message,
                    additionalInformation: payload?.additionalInformation,
                    severity: payload.logSeverity
                });
            }
        }
    }

    public debug(message: string, additionalInformation?: object): void {
        console.debug(message, additionalInformation);
        this.sendToDiscord({ message: message, additionalInformation: additionalInformation, logSeverity: SEVERITY.DEBUG });
    }

    public info(message: string, additionalInformation?: object): void {
        console.log(message, additionalInformation);
        this.sendToDiscord({ message: message, additionalInformation: additionalInformation, logSeverity: SEVERITY.INFO });
    }

    public error(message: string, additionalInformation?: object): void {
        console.error(message, additionalInformation);
        this.sendToDiscord({ message: message, additionalInformation: additionalInformation, logSeverity: SEVERITY.ERROR });
    }

    public warn(message: string, additionalInformation?: object): void {
        console.warn(message, additionalInformation);
        this.sendToDiscord({ message: message, additionalInformation: additionalInformation, logSeverity: SEVERITY.WARNING });
    }
}