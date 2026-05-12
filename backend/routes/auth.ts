import {Router} from 'express'
import { CreateUser, Signin } from '../types';
import {TOTP} from 'totp-generator'
import base32 from "hi-base32";
import { otpEmailHTML } from '../emailTemplates/otpMail';
import jwt from 'jsonwebtoken';
import {User} from '../models/User'
import { authMiddleware } from '../middlewares/authMiddleware';
import { otpLimiter, signinLimiter } from '../middlewares/rateLimiter';
const router = Router();

// OTP cache with expiration (5 minutes)
const OTP_TTL_MS = 5 * 60 * 1000;
const otpCache = new Map<string, { otp: string; expiresAt: number }>();

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [email, entry] of otpCache) {
        if (now > entry.expiresAt) {
            otpCache.delete(email);
        }
    }
}, 5 * 60 * 1000);

router.post('/initiate-signin', otpLimiter, async (req, res) => {
    try{
        const {success, data} = CreateUser.safeParse(req.body)
        if(!success){
            res.status(411).send("Invalid Input")
            return
        }
        
        //Generate OTP using email and secret
        const {otp} = TOTP.generate(base32.encode(data.email+process.env.JWT))
        if(process.env.ENV != "development"){
            //const html = otpEmailHTML(otp, data.email, 30)
            //Send Email
            console.log("Email sent")
        }
        console.log(`Email:${data.email}, otp:${otp}`)

        //Cache OTP with expiration
        otpCache.set(data.email, { otp, expiresAt: Date.now() + OTP_TTL_MS });

        //Create User
        try{
            const user = await User.findOne({email:data.email})
            if(!user){
                let user = new User({email:data.email, name:data.name})
                await user.save()
                console.log(`User Created: ${user._id}`)
            }
            
        } catch(e){
            console.log("User already exists")
        }

        res.json({
            message:"Check your email",
            success: true
        })

    } catch(e){
        console.log(e);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
})

router.post('/signin', signinLimiter, async (req, res) => {
    //Check Req types
    const {success, data} = Signin.safeParse(req.body);
    if(!success){
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
    console.log("Done otp validation")

    //Finds user in DB.
    const user = await User.findOne({email:data.email})
    if (!user)
    {
        res.status(401).json({
            message: "User not exist, Please Signup"
        }
        )
        return;
    }
    console.log("Done finding user")

    //Signs a JWT for session.
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT,
        { expiresIn: "7d" }
    );

    console.log(token)
    console.log("Done signing")
    
    //Sends back { token } with plan info
    res.status(200).json(
        {
            "name": user.name,
            "token" : token,
            "userId": user._id,
            "isPremium": user.isPremium,
            "plan": user.plan || "free",
            "credits": user.credits,
            "profile": user.profile || {},
        }
    )

})

router.get("/me", authMiddleware, async (req, res) => {
    const user = await User.findById(req.userId);

    if (!user) {
        res.status(401).send({
            message: "Unauthorized",
            success: false,
        });
        return;
    }

    res.json({
        user: {
            id: user?._id,
            email: user?.email,
            name: user?.name,
            isPremium: user?.isPremium,
            plan: user?.plan || "free",
            credits: user?.credits,
            profile: user?.profile || {},
        }
    })
})

router.put("/profile", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const profileData = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.profile = {
            ...user.profile,
            ...profileData
        };

        // If user wants to update their main name (e.g. from profile page)
        if (profileData.firstName && profileData.lastName) {
             user.name = `${profileData.firstName} ${profileData.lastName}`;
        } else if (profileData.firstName) {
             user.name = profileData.firstName;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: user.profile
        });
    } catch (e) {
        console.error("PUT /auth/profile error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;