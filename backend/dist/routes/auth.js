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
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// OTP cache with expiration (5 minutes)
const OTP_TTL_MS = 5 * 60 * 1000;
const otpCache = new Map();
// Cleanup expired OTPs every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [email, entry] of otpCache) {
        if (now > entry.expiresAt) {
            otpCache.delete(email);
        }
    }
}, 5 * 60 * 1000);
router.post('/initiate-signin', rateLimiter_1.otpLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        //Cache OTP with expiration
        otpCache.set(data.email, { otp, expiresAt: Date.now() + OTP_TTL_MS });
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
router.post('/signin', rateLimiter_1.signinLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Check Req types
    const { success, data } = types_1.Signin.safeParse(req.body);
    if (!success) {
        res.status(411).send("Invalid input");
        return;
    }
    //Validate the OTP (with expiration check)
    const cachedEntry = otpCache.get(data.email);
    if (!cachedEntry || String(data.otp) !== cachedEntry.otp || Date.now() > cachedEntry.expiresAt) {
        res.status(401).json({ message: "Invalid or expired OTP" });
        return;
    }
    // Delete OTP after successful validation
    otpCache.delete(data.email);
    console.log("Done otp validation");
    //Finds user in DB.
    const user = yield User_1.User.findOne({ email: data.email });
    if (!user) {
        res.status(401).json({
            message: "User not exist, Please Signup"
        });
        return;
    }
    console.log("Done finding user");
    //Signs a JWT for session.
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT, { expiresIn: "7d" });
    console.log(token);
    console.log("Done signing");
    //Sends back { token } with plan info
    res.status(200).json({
        "name": user.name,
        "token": token,
        "userId": user._id,
        "isPremium": user.isPremium,
        "plan": user.plan || "free",
        "credits": user.credits,
        "profile": user.profile || {},
    });
}));
router.get("/me", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findById(req.userId);
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
            name: user === null || user === void 0 ? void 0 : user.name,
            isPremium: user === null || user === void 0 ? void 0 : user.isPremium,
            plan: (user === null || user === void 0 ? void 0 : user.plan) || "free",
            credits: user === null || user === void 0 ? void 0 : user.credits,
            profile: (user === null || user === void 0 ? void 0 : user.profile) || {},
        }
    });
}));
router.put("/profile", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const profileData = req.body;
    try {
        const user = yield User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.profile = Object.assign(Object.assign({}, user.profile), profileData);
        // If user wants to update their main name (e.g. from profile page)
        if (profileData.firstName && profileData.lastName) {
            user.name = `${profileData.firstName} ${profileData.lastName}`;
        }
        else if (profileData.firstName) {
            user.name = profileData.firstName;
        }
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: user.profile
        });
    }
    catch (e) {
        console.error("PUT /auth/profile error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
exports.default = router;
//# sourceMappingURL=auth.js.map