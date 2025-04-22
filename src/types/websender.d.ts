export interface WebsenderConfig {
    host: string;
    password: string;
    port: number;
    timeout?: number;
}

export interface WebsenderResponse {
    success: boolean;
    error?: string;
}

export class Websender {
    private host: string;
    private password: string;
    private port: number;
    private timeout: number;
    private socket: net.Socket | null;

    constructor(config: WebsenderConfig);
    connect(): Promise<WebsenderResponse>;
    sendCommand(command: string): Promise<WebsenderResponse>;
    sendMessage(message: string): Promise<WebsenderResponse>;
    disconnect(): Promise<WebsenderResponse>;
    private writeRawInt(value: number): void;
    private writeRawByte(byte: number): void;
    private writeString(str: string): void;
    private readRawInt(): number;
    private readRawByte(): number;
}
