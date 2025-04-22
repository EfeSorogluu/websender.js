# WebSender JS

WebSender JS is a TypeScript library that allows you to connect to Minecraft servers via WebSocket and send commands. This library provides a secure and easy way to interact with Minecraft servers.

## Features

- Connect to Minecraft servers via WebSocket
- Send commands and receive responses
- TypeScript support
- Easy to use and integrate
- Example applications and usage scenarios

## Installation

```bash
npm install websender-js
```

## Usage

### Basic Connection

```typescript
import { WebSender } from 'websender-js';

const sender = new WebSender({
  host: 'localhost',
  port: 8080,
  password: 'your-password'
});

// Start connection
await sender.connect();

// Send command
const response = await sender.sendCommand('say Hello World!');

// Close connection
await sender.disconnect();
```

### Example Applications

The project includes various example applications:

- `connection_test.ts`: Basic connection test
- `command_line.ts`: Command line interface
- `merchant.ts`: Merchant operations example
- `command_input.ts`: User input command example

## API Reference

### WebSender Class

```typescript
class WebSender {
  constructor(config: WebSenderConfig);
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendCommand(command: string): Promise<string>;
}
```

### WebSenderConfig Interface

```typescript
interface WebSenderConfig {
  host: string;
  port: number;
  password: string;
}
```

## Development

To develop the project:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Testing

To run tests:

```bash
npm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

For questions or suggestions, please use GitHub Issues.
