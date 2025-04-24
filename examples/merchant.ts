import { Websender } from "../src/index.js";
import { Command } from "commander";

const program = new Command();

program
    .name('merchant')
    .description('Minecraft merchant system')
    .version('1.0.0');

program
    .command('buy')
    .description('Buy an item')
    .requiredOption('-p, --player <name>', 'Player name')
    .requiredOption('-i, --item <item>', 'Item to buy (chest, iron_sword, iron_chestplate)')
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

        // Map item names to Minecraft item IDs
        const itemMap: { [key: string]: string } = {
            'chest': 'chest',
            'iron_sword': 'iron_sword',
            'iron_chestplate': 'iron_chestplate'
        };

        const minecraftItem = itemMap[options.item];
        if (!minecraftItem) {
            console.error('Invalid item selected');
            await websender.disconnect();
            return;
        }

        const command = `give ${options.player} ${minecraftItem} 1`;
        const result = await websender.sendCommand(command);

        if (!result.success) {
            console.error('Error giving item:', result.error);
        } else {
            console.log(`Successfully gave ${options.item} to ${options.player}`);
        }

        await websender.disconnect();
    });

program.parse(process.argv); 