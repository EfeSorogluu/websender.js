import type { WebsenderConfig, WebsenderResponse } from '../types/websender';
export declare class Websender {
    private host;
    private password;
    private port;
    private timeout;
    private socket;
    constructor(config: WebsenderConfig);
    connect(): Promise<WebsenderResponse>;
    sendCommand(command: string): Promise<WebsenderResponse>;
    sendMessage(message: string): Promise<WebsenderResponse>;
    disconnect(): Promise<WebsenderResponse>;
    private writeRawInt;
    private writeRawByte;
    private writeString;
    private readRawInt;
    private readRawByte;
}
