import { Websender } from './libs/websender.js';
import type { WebsenderConfig, WebsenderResponse } from './types/websender.d.js';

export {
    Websender,
    type WebsenderConfig,
    type WebsenderResponse
};

export default Websender;

console.log('Use "npm run test" to test the library.');