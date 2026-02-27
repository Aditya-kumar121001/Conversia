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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Waitlist_1 = require("../models/Waitlist");
const waitlistMail_1 = require("../emailTemplates/waitlistMail");
const postmark_1 = require("../postmark");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    console.log(email);
    try {
        //chech if email already exist in waitlist
        const user = yield Waitlist_1.Waitlist.findOne({ email: email });
        if (!user) {
            //add in waitlist 
            let newWaitlistMail = new Waitlist_1.Waitlist({ email: email });
            yield newWaitlistMail.save();
            console.log(`new waitlist entry: ${email}`);
            //send waitlist mail
            const subject = "You're on the Conversia.ai waitlist";
            const text = "";
            const html = (0, waitlistMail_1.waitlistEmailHTML)(email);
            yield (0, postmark_1.sendEmail)({ to: email, subject, text, html });
        }
        res.status(201).json({
            status: true,
            message: "Check your mail"
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
}));
exports.default = router;
//# sourceMappingURL=waitlist.js.map