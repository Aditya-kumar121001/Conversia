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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const types_1 = require("../types");
const totp_generator_1 = require("totp-generator");
const hi_base32_1 = __importDefault(require("hi-base32"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const otpCache = new Map();
router.post('/initiate-signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { success, data } = types_1.CreateUser.safeParse(req.body);
        if (!success) {
            res.status(411).send("Invalid Input");
            return;
        }
        //Generate OTP using email and secret
        const { otp } = totp_generator_1.TOTP.generate(hi_base32_1.default.encode(data.email + process.env.JWT));
        if (process.env.ENV != "development") {
            //const html = otpEmailHTML(otp, data.email, 30)
            //Send Email
            console.log("Email sent");
        }
        console.log(`Email:${data.email}, otp:${otp}`);
        //Cache OTP
        otpCache.set(data.email, otp);
        //Create User
        try {
            const user = yield User_1.User.findOne({ email: data.email });
            if (!user) {
                let user = new User_1.User({ email: data.email, name: data.name });
                yield user.save();
                console.log(`User Created: ${user._id}`);
            }
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
}));
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const user = yield User_1.User.findOne({ email: data.email });
    if (!user) {
        res.status(401).json({
            message: "User not exist, Please Signup"
        });
    }
    console.log("Done finding user");
    //Signs a JWT for session.
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT, { expiresIn: "7d" });
    console.log(token);
    console.log("Done signing");
    //Sends back { token }
    res.status(200).json({
        "name": user.name,
        "token": token,
        "userId": user._id
    });
}));
router.get("/me", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findOne({
        where: { id: req.userId }
    });
    if (!user) {
        res.status(401).send({
            message: "Unauthorized",
            success: false,
        });
        return;
    }
    res.json({
        user: {
            id: user === null || user === void 0 ? void 0 : user._id,
            email: user === null || user === void 0 ? void 0 : user.email,
        }
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map