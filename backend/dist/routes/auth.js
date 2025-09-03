"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const types_1 = require("../types");
const totp_generator_1 = require("totp-generator");
const hi_base32_1 = __importDefault(require("hi-base32"));
const emailTemplate_1 = require("../emailTemplate");
const router = (0, express_1.Router)();
const users = [];
router.post('/initial-signin', (req, res) => {
    const { success, data } = types_1.CreateUser.safeParse(req.body);
    if (!success) {
        res.status(411).send("Invalid Input");
        return;
    }
    //Generate OTP using email and secret
    console.log(users);
    const otp = totp_generator_1.TOTP.generate(hi_base32_1.default.encode(data.email + process.env.JWT));
    console.log(`Email:${data.email}, otp:${otp.otp}`);
    const html = (0, emailTemplate_1.otpEmailHTML)(otp.otp, data.email, 30);
    users.push(data.email);
    console.log(users);
    res.send(html);
});
router.post('/signin', (req, res) => {
});
exports.default = router;
//# sourceMappingURL=auth.js.map