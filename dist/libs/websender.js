import * as net from 'net';
import * as crypto from 'crypto';
export class Websender {
    host;
    password;
    port;
    timeout;
    socket = null;
    constructor(config) {
        this.host = config.host;
        this.password = config.password;
        this.port = config.port;
        this.timeout = config.timeout || 30;
    }
    async connect() {
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
                        const challenge = await this.readRawInt();
                        // Calculate and send hash
                        const hash = crypto.createHash('sha512')
                            .update(challenge.toString() + this.password)
                            .digest('hex');
                        this.writeString(hash);
                        // Wait for response
                        const response = await this.readRawInt();
                        resolve({
                            success: response === 1
                        });
                    }
                    catch (error) {
                        console.error('[WebSenderJS] Authentication error:', error);
                        resolve({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error during authentication'
                        });
                    }
                });
                this.socket.on('error', (error) => {
                    console.error('[WebSenderJS] Socket error:', error);
                    let errorMessage = 'Connection error';
                    if (error.code === 'ECONNREFUSED') {
                        errorMessage = `Connection refused. Please check if:
                        1. The Minecraft server is running
                        2. The Websender plugin is installed
                        3. The port ${this.port} is correct
                        4. The server is not blocking connections`;
                    }
                    else if (error.code === 'ETIMEDOUT') {
                        errorMessage = 'Connection timed out. The server might be down or unreachable';
                    }
                    else if (error.code === 'ENOTFOUND') {
                        errorMessage = `Could not resolve host ${this.host}. Please check if the hostname is correct`;
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
            }
            catch (error) {
                console.error('[WebSenderJS] Connection setup error:', error);
                resolve({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error during connection setup'
                });
            }
        });
    }
    async sendCommand(command) {
        if (!this.socket) {
            return { success: false, error: 'Not connected' };
        }
        try {
            this.writeRawByte(2);
            this.writeString(Buffer.from(command).toString('base64'));
            const response = await this.readRawInt();
            return { success: response === 1 };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async sendMessage(message) {
        if (!this.socket) {
            return { success: false, error: 'Not connected' };
        }
        try {
            this.writeRawByte(4);
            this.writeString(Buffer.from(message).toString('base64'));
            const response = await this.readRawInt();
            return { success: response === 1 };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async disconnect() {
        if (!this.socket) {
            return { success: false, error: 'Not connected' };
        }
        try {
            this.writeRawByte(3);
            this.socket.destroy();
            this.socket = null;
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    writeRawInt(value) {
        if (!this.socket)
            return;
        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(value, 0);
        this.socket.write(buffer);
    }
    writeRawByte(byte) {
        if (!this.socket)
            return;
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(byte, 0);
        this.socket.write(buffer);
    }
    writeString(str) {
        if (!this.socket)
            return;
        const chars = str.split('');
        this.writeRawInt(chars.length);
        for (const char of chars) {
            const code = char.charCodeAt(0);
            this.writeRawByte((0xff & (code >> 8)));
            this.writeRawByte((0xff & code));
        }
    }
    readRawInt() {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Not connected'));
                return;
            }
            const readData = () => {
                const buffer = this.socket.read(4);
                if (buffer) {
                    resolve(buffer.readInt32BE(0));
                }
                else {
                    this.socket.once('readable', readData);
                }
            };
            readData();
        });
    }
    readRawByte() {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Not connected'));
                return;
            }
            const readData = () => {
                const buffer = this.socket.read(1);
                if (buffer) {
                    resolve(buffer.readUInt8(0));
                }
                else {
                    this.socket.once('readable', readData);
                }
            };
            readData();
        });
    }
}
//# sourceMappingURL=websender.js.map