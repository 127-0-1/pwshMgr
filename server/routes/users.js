const express = require("express");
const UserController = require("../controllers/user");
const router = express.Router();
const User = require("../models/user")
const crypto = require("crypto")
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs")

router.post("/register", UserController.createUser);

router.post("/login", UserController.userLogin);

router.post('/request-reset-password', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).json({ message: "email address not found" })
    }
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10)
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 3600000
    await User.findOneAndUpdate({ _id: user._id }, user)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: user.email,
        subject: "Password reset link",
        text: `password reset link: http://localhost:4200/login/reset-password/${token}`
    }
    await transporter.sendMail(mailOptions)
    res.json({ message: 'SUCCESS' })
})

router.post("/reset-password", async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).json({ message: 'Email not found' })
    }
    const hash = await bcrypt.compare(req.body.token, user.resetPasswordToken)
    if (!hash) {
        return res.status(401).json({ message: "invalid token" })
    }
    const currentDate = new Date()
    const expiryDate = new Date(user.resetPasswordExpires)
    if (currentDate > expiryDate) {
        return res.status(401).json({ message: "token expired" })
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    user.password = hashedPassword
    user.resetPasswordExpires = null
    user.resetPasswordToken = null
    await User.findOneAndUpdate({ _id: user._id }, user)
    res.send({ message: 'SUCCESS' })
})

module.exports = router;