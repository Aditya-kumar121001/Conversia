import {Router} from 'express'
import { CreateUser, Signin } from '../types';
import {TOTP} from 'totp-generator'
import base32 from "hi-base32";
import { otpEmailHTML } from '../emailTemplate';
import jwt from 'jsonwebtoken';
import generateUniqueId from 'generate-unique-id'
import {User} from '../models/User'
import { authMiddleware } from '../middlewares/authMiddleware';
const router = Router();

const otpCache = new Map<string,string>();

router.post('/initiate-signin', async (req, res) => {
    try{
        const {success, data} = CreateUser.safeParse(req.body)
        if(!success){
            res.status(411).send("Invalid Input") 
            return
        }
            
        //Generate OTP using email and secret
        const {otp} = TOTP.generate(base32.encode(data.email+process.env.JWT))
        if(process.env.ENV != "development"){
            const html = otpEmailHTML(otp, data.email, 30)
            //Send Email
            console.log("Email sent")
        }
        console.log(`Email:${data.email}, otp:${otp}`)

        //Cache OTP
        otpCache.set(data.email,otp)

        //Create User
        try{
            const user = await User.findOne({email:data.email})
            if(!user){
                let user = new User({email:data.email})
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

router.post('/signin', async (req, res) => {
    //Check Req types
    const {success, data} = Signin.safeParse(req.body);
    if(!success){
        res.status(411).send("Invalid input");
        return;
    }
    //Validate the OTP
    if(data.otp !== otpCache.get(data.email)){
        res.status(401).json(
            {
                message:"Invalid otp"
            }
        )
        return
    }
    console.log("Done otp validation")

    //Finds user in DB.
    const user = await User.findOne({email:data.email})
    if (!user)
    {
        res.status(401).json({
            message: "User not exist, Please Signup"
        }
        )
    }
    console.log("Done finding user")

    //Signs a JWT for session.
    const token = jwt.sign({userId : user._id}, process.env.JWT)
    console.log(token)
    console.log("Done signing")
    //Sends back { token }

    res.status(200).json(
        { 
            "token" : token,
            "userId": user._id
        }
    )

})

router.get("/me", authMiddleware, async (req, res) => {
    const user = await User.findOne({
        where: { id: req.userId }
    })

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
        }
    })
})
export default router;