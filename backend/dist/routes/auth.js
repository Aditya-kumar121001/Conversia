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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generate_unique_id_1 = __importDefault(require("generate-unique-id"));
const router = (0, express_1.Router)();
const users = [];
const otpCache = new Map();
router.post('/initiate-signin', (req, res) => {
    try {
        const { success, data } = types_1.CreateUser.safeParse(req.body);
        if (!success) {
            res.status(411).send("Invalid Input");
            return;
        }
        //Generate OTP using email and secret
        console.log(users);
        const { otp } = totp_generator_1.TOTP.generate(hi_base32_1.default.encode(data.email + process.env.JWT));
        console.log(`Email:${data.email}, otp:${otp}`);
        const html = (0, emailTemplate_1.otpEmailHTML)(otp, data.email, 30);
        //Send Email
        res.send(html);
        //Cache OTP
        otpCache.set(data.email, otp);
        //Create User
        try {
            users.push(data.email);
            console.log(users);
        }
        catch (e) {
            console.log("User already exists");
        }
        res.json({
            message: "Check your email",
            success: true
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
});
router.post('/signin', (req, res) => {
    //Check Req types
    const { success, data } = types_1.Signin.safeParse(req.body);
    if (!success) {
        res.status(411).send("Invalid input");
        return;
    }
    //Validate the OTP
    if (data.otp !== otpCache.get(data.email)) {
        res.status(401).json({
            message: "Invalid otp"
        });
        return;
    }
    console.log("Done otp validation");
    //Finds user in DB.
    if (!users.includes(data.email)) {
        res.status(401).json({
            message: "User not exist, Please Signup"
        });
    }
    console.log("Done finding user");
    //Signs a JWT for session.
    const userId = (0, generate_unique_id_1.default)({
        length: 32,
        useLetters: false
    });
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT);
    console.log(token);
    console.log("Done signing");
    //Sends back { token }
    res.status(200).json({ token });
});
exports.default = router;
//# sourceMappingURL=auth.js.map