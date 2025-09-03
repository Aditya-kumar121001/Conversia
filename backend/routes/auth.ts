import {Router} from 'express'
import { CreateUser } from '../types';
import {TOTP} from 'totp-generator'
import base32 from "hi-base32";
import { otpEmailHTML } from '../emailTemplate';

const router = Router();

const users = []

router.post('/initial-signin', (req, res) => {
    const {success, data} = CreateUser.safeParse(req.body)
    if(!success){
        res.status(411).send("Invalid Input")
        return
    }
        
    //Generate OTP using email and secret
    console.log(users)
    const otp = TOTP.generate(base32.encode(data.email+process.env.JWT))
    console.log(`Email:${data.email}, otp:${otp.otp}`)
    const html = otpEmailHTML(otp.otp, data.email, 30)
    users.push(data.email);
    console.log(users)
    res.send(html)
})

router.post('/signin', (req, res) => {

})

export default router;