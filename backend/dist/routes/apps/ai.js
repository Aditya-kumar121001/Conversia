"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const elevenlabs_js_1 = require("@elevenlabs/elevenlabs-js");
const stream_1 = require("stream");
const elevenlabs = new elevenlabs_js_1.ElevenLabsClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        const audioStream = yield elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
            text: 'This is a test',
            modelId: 'eleven_multilingual_v2',
        });
        // option 1: play the streamed audio locally
        yield (0, elevenlabs_js_1.stream)(stream_1.Readable.from(audioStream));
        try {
            // option 2: process the audio manually
            for (var _d = true, audioStream_1 = __asyncValues(audioStream), audioStream_1_1; audioStream_1_1 = yield audioStream_1.next(), _a = audioStream_1_1.done, !_a; _d = true) {
                _c = audioStream_1_1.value;
                _d = false;
                const chunk = _c;
                console.log(chunk);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = audioStream_1.return)) yield _b.call(audioStream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
main();
//# sourceMappingURL=ai.js.map