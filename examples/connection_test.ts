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
    } else {
        console.log('Minecraft Connection successful!');
    }

    const commandResult = await websender.sendCommand('say Hello from TypeScript!');
    
    if (!commandResult.success) {
        console.error('Command error:', commandResult.error);
    } else {
        console.log('Command sent successfully!');
    }

}   

main();
