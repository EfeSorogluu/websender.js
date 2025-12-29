interface WebsenderConfig {
    host: string;
    password: string;
    port: number;
    timeout?: number;
}

interface WebsenderResponse {
    success: boolean;
    error?: string;
}

declare class Websender {
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

export { Websender, type WebsenderConfig, type WebsenderResponse, Websender as default };
