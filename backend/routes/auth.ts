import {Router} from 'express'
import { CreateUser, Signin } from '../types';
import {TOTP} from 'totp-generator'
import base32 from "hi-base32";
import { otpEmailHTML } from '../emailTemplate';
import jwt from 'jsonwebtoken';
import generateUniqueId from 'generate-unique-id'
const router = Router();

const users = [];
const otpCache = new Map<string,string>();

router.post('/initiate-signin', (req, res) => {
    try{
        const {success, data} = CreateUser.safeParse(req.body)
        if(!success){
            res.status(411).send("Invalid Input")
            return
        }
            
        //Generate OTP using email and secret
        console.log(users)
        const {otp} = TOTP.generate(base32.encode(data.email+process.env.JWT))
        console.log(`Email:${data.email}, otp:${otp}`)
        const html = otpEmailHTML(otp, data.email, 30)
        //Send Email
        res.send(html)

        //Cache OTP
        otpCache.set(data.email,otp)

        //Create User
        try{
            users.push(data.email);
            console.log(users)
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

router.post('/signin', (req, res) => {
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
    if (!users.includes(data.email))
    {
        res.status(401).json({
            message: "User not exist, Please Signup"
        }
        )
    }
    console.log("Done finding user")

    //Signs a JWT for session.
    const userId = generateUniqueId({
        length: 32,
        useLetters: false
    });

    const token = jwt.sign({userId}, process.env.JWT)
    console.log(token)
    console.log("Done signing")
    //Sends back { token }

    res.status(200).json({ token })

})

export default router;