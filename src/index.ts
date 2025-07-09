import { Websender } from './libs/websender.js';
import type { WebsenderConfig, WebsenderResponse } from './types/websender';

export {
    Websender,
    type WebsenderConfig,
    type WebsenderResponse
};

export default Websender;

console.log('Use "npm run test" to test the library.');

// CommonJS desteği için:
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Websender;
}