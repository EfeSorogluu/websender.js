"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Websender = void 0;
const websender_js_1 = require("./libs/websender.js");
Object.defineProperty(exports, "Websender", { enumerable: true, get: function () { return websender_js_1.Websender; } });
exports.default = websender_js_1.Websender;
console.log('Use "npm run test" to test the library.');
// CommonJS desteği için:
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = websender_js_1.Websender;
}
//# sourceMappingURL=index.js.map