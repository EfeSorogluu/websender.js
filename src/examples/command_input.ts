import { Websender } from "../index.js";
import { Command } from "commander";

const program = new Command();

program
    .name('command-input')
    .description('Send custom commands to Minecraft server')
    .version('1.0.0');

program
    .command('send')
    .description('Send a command to the server')
    .requiredOption('-c, --command <command>', 'Command to send')
    .action(async (options) => {
        const websender = new Websender({
            host: 'localhost',
            password: '123456aa',
            port: 9876
        });

        const connection = await websender.connect();
        
        if (!connection.success) {
            console.error('Connection error:', connection.error);
            return;
        }

        console.log('Connected to Minecraft server');

        const result = await websender.sendCommand(options.command);

        if (!result.success) {
            console.error('Error executing command:', result.error);
        } else {
            console.log('Command executed successfully');
        }

        await websender.disconnect();
    });

program.parse(process.argv); 