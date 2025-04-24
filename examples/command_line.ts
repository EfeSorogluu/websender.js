import { Websender } from "../src/index.js";

const websender = new Websender({
    host: 'localhost',
    password: '123456aa',
    port: 9876
});

async function main() {
    const connection = await websender.connect();
    
    if (!connection.success) {
        console.error('Connection error:', connection.error);
        return;
    }

    console.log('Connected successfully!');

    // Send some example commands
    const commands = [
        'gamemode survival EfeSoroglu',
        'say test',
        'perms'
    ];

    for (const command of commands) {
        const result = await websender.sendCommand(command);
        if (!result.success) {
            console.error(`Error executing command "${command}":`, result.error);
        } else {
            console.log(`Command "${command}" executed successfully`);
        }
    }

    // Send a message
    const messageResult = await websender.sendMessage('hello server!');
    if (!messageResult.success) {
        console.error('Error sending message:', messageResult.error);
    } else {
        console.log('Message sent successfully');
    }

    // Disconnect
    await websender.disconnect();
    console.log('Disconnected from server');
}

main().catch(console.error); 