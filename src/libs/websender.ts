import * as net from 'net';
import * as crypto from 'crypto';
import type { WebsenderConfig, WebsenderResponse } from '../types/websender';

interface SocketError extends Error {
    code?: string;
}

export class Websender {
    private host: string;
    private password: string;
    private port: number;
    private timeout: number;
    private socket: net.Socket | null = null;

    constructor(config: WebsenderConfig) {
        this.host = config.host;
        this.password = config.password;
        this.port = config.port;
        this.timeout = config.timeout || 30;
    }

    public async connect(): Promise<WebsenderResponse> {
        return new Promise((resolve) => {
            try {
                this.socket = net.createConnection({
                    host: this.host,
                    port: this.port,
                    timeout: this.timeout * 1000
                });

                this.socket.on('connect', async () => {
                    try {
                        // Send connection request
                        this.writeRawByte(1);
                        
                        // Wait for challenge
                        const challengeUnsigned = await this.readRawInt();
                        
                        // Convert to signed int32 (server uses signed int)
                        const challenge = challengeUnsigned > 0x7FFFFFFF 
                            ? challengeUnsigned - 0x100000000 
                            : challengeUnsigned;
                        
                        // Calculate and send hash
                        const hashInput = challenge.toString() + this.password;
                        const hash = crypto.createHash('sha512')
                            .update(hashInput)
                            .digest('hex');
                        this.writeString(hash);
                        
                        // Wait for response
                        const response = await this.readRawInt();
                        
                        if (response === 1) {
                            resolve({
                                success: true
                            });
                        } else {
                            resolve({
                                success: false,
                                error: 'Authentication failed. Please check your password.'
                            });
                        }
                    } catch (error) {
                        console.error('[WebSenderJS] Authentication error:', error);
                        resolve({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error during authentication'
                        });
                    }
                });

                this.socket.on('error', (error: SocketError) => {
                    console.error('[WebSenderJS] Socket error:', error);
                    let errorMessage = 'Connection error';
                    
                    if (error.code === 'ECONNREFUSED') {
                        errorMessage = `Connection refused. Please check if:
                        1. The Minecraft server is running
                        2. The Websender plugin is installed
                        3. The port ${this.port} is correct
                        4. The server is not blocking connections`;
                    } else if (error.code === 'ETIMEDOUT') {
                        errorMessage = 'Connection timed out. The server might be down or unreachable';
                    } else if (error.code === 'ENOTFOUND') {
                        errorMessage = `Could not resolve host ${this.host}. Please check if the hostname is correct`;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    
                    resolve({
                        success: false,
                        error: errorMessage
                    });
                });

                this.socket.on('timeout', () => {
                    console.error('[WebSenderJS] Connection timeout');
                    resolve({
                        success: false,
                        error: 'Connection timeout. The server might be down or unreachable'
                    });
                });
            } catch (error) {
                console.error('[WebSenderJS] Connection setup error:', error);
                resolve({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error during connection setup'
                });
            }
        });
    }

    public async sendCommand(command: string): Promise<WebsenderResponse> {
        if (!this.socket) {
            return { success: false, error: 'Not connected' };
        }

        try {
            this.writeRawByte(2);
            this.writeString(Buffer.from(command).toString('base64'));
            const response = await this.readRawInt();
            return { success: response === 1 };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    public async sendMessage(message: string): Promise<WebsenderResponse> {
        if (!this.socket) {
            return { success: false, error: 'Not connected' };
        }

        try {
            this.writeRawByte(4);
            this.writeString(Buffer.from(message).toString('base64'));
            const response = await this.readRawInt();
            return { success: response === 1 };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    public async disconnect(): Promise<WebsenderResponse> {
        if (!this.socket) {
            return { success: false, error: 'Not connected' };
        }

        try {
            this.writeRawByte(3);
            this.socket.destroy();
            this.socket = null;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    public async close(): Promise<WebsenderResponse> {
        return this.disconnect();
    }

    private writeRawInt(value: number): void {
        if (!this.socket) return;
        const buffer = Buffer.alloc(4);
        buffer.writeUInt32BE(value, 0);
        this.socket.write(buffer);
    }

    private writeRawByte(byte: number): void {
        if (!this.socket) return;
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(byte, 0);
        this.socket.write(buffer);
    }

    private writeString(str: string): void {
        if (!this.socket) return;
        const chars = str.split('');
        const length = chars.length;
        
        // Calculate total buffer size: 4 bytes for length + 2 bytes per character
        const bufferSize = 4 + (length * 2);
        const buffer = Buffer.alloc(bufferSize);
        
        // Write length as uint32 big-endian
        buffer.writeUInt32BE(length, 0);
        
        // Write each character as 2 bytes (big-endian)
        let offset = 4;
        for (const char of chars) {
            const code = char.charCodeAt(0);
            buffer.writeUInt8((0xff & (code >> 8)), offset++);
            buffer.writeUInt8((0xff & code), offset++);
        }
        
        // Send entire buffer at once
        this.socket.write(buffer);
    }

    private readRawInt(): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Not connected'));
                return;
            }

            const readData = () => {
                const buffer = this.socket!.read(4);
                if (buffer) {
                    resolve(buffer.readUInt32BE(0));
                } else {
                    this.socket!.once('readable', readData);
                }
            };

            readData();
        });
    }

    private readRawByte(): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Not connected'));
                return;
            }

            const readData = () => {
                const buffer = this.socket!.read(1);
                if (buffer) {
                    resolve(buffer.readUInt8(0));
                } else {
                    this.socket!.once('readable', readData);
                }
            };

            readData();
        });
    }
}
