"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const axios_1 = __importDefault(require("axios"));
function sendEmail(arg1, subject, body) {
    var _a;
    let to;
    let textBody;
    let htmlBody;
    if (typeof arg1 === "string") {
        // Old style : sendEmail(to, subject, body)
        to = arg1;
        textBody = body;
        htmlBody = body;
    }
    else {
        // New style : sendEmail({ to, subject, text, html })
        to = arg1.to;
        subject = arg1.subject;
        textBody = arg1.text;
        htmlBody = (_a = arg1.html) !== null && _a !== void 0 ? _a : arg1.text; // fallback to text if no html
    }
    let data = JSON.stringify({
        "From": process.env.FROM_EMAIL,
        "To": to,
        "Subject": subject,
        "TextBody": textBody,
        "HtmlBody": htmlBody,
        "MessageStream": "outbound"
    });
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.postmarkapp.com/email',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Postmark-Server-Token': process.env.POSTMARK
        },
        data: data
    };
    return axios_1.default.request(config);
}
//# sourceMappingURL=postmark.js.map