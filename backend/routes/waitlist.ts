import { Router } from "express"
import { Waitlist } from "../models/Waitlist";
import { waitlistEmailHTML } from "../emailTemplates/waitlistMail"
import { sendEmail } from "../postmark"

const router = Router();

router.post('/register', async (req, res) => {
    const {email} = req.body;
    console.log(email)
    try{
        //chech if email already exist in waitlist
        const user = await Waitlist.findOne({email: email})
        if(!user){
            //add in waitlist 
            let newWaitlistMail = new Waitlist({email: email})
            await newWaitlistMail.save()
            console.log(`new waitlist entry: ${email}`)
            //send waitlist mail
            const subject = "You're on the Conversia.ai waitlist";
            const text = ""
            const html = waitlistEmailHTML(email);
            await sendEmail({ to: email, subject, text, html });
        }

        res.status(201).json({
            status: true,
            message: "Check your mail"
        })

    }
    catch(e){
        console.log(e);
        return res.status(500).json({
            status:false,
            message:"Server error"
        });
    }
    
})

export default router;
