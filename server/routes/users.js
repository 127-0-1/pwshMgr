const express = require("express");
const UserController = require("../controllers/user");
const router = express.Router();
const User = require("../models/user")
const crypto = require("crypto")
const nodemailer = require("nodemailer");

router.post("/register", UserController.createUser);

router.post("/login", UserController.userLogin);

router.post('/reset-password', async (req, res) => {

    const user = await User.findOne({email: req.body.email})

    if (!user) {
        return res.status(404).json({message: "email address not found"})
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = token

    user.resetPasswordExpires = Date.now() + 360000

    await User.findOneAndUpdate({_id: user._id}, user)

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
        text: `password reset link: http://localhost:4200/reset-password/${token}`
    }

    await transporter.sendMail(mailOptions)

    res.json({ message: 'SUCCESS' })
})


// userRoutes.post('/reset-password', function (req, res) {
//     const email = req.body.email
//     User
//         .findOne({
//             where: {email: email},//checking if the email address sent by client is present in the db(valid)
//         })
//         .then(function (user) {
//             if (!user) {
//                 return throwFailed(res, 'No user found with that email address.')
//             }
//             ResetPassword
//                 .findOne({
//                     where: {userId: user.id, status: 0},
//                 }).then(function (resetPassword) {
//                 if (resetPassword)
//                     resetPassword.destroy({
//                         where: {
//                             id: resetPassword.id
//                         }
//                     })
//                 token = crypto.randomBytes(32).toString('hex')//creating the token to be sent to the forgot password form (react)
//                 bcrypt.hash(token, null, null, function (err, hash) {//hashing the password to store in the db node.js
//                     ResetPassword.create({
//                         userId: user.id,
//                         resetPasswordToken: hash,
//                         expire: moment.utc().add(config.tokenExpiry, 'seconds'),
//                     }).then(function (item) {
//                         if (!item)
//                             return throwFailed(res, 'Oops problem in creating new password record')
//                         let mailOptions = {
//                             from: '"<jyothi pitta>" jyothi.pitta@ktree.us',
//                             to: user.email,
//                             subject: 'Reset your account password',
//                             html: '<h4><b>Reset Password</b></h4>' +
//                             '<p>To reset your password, complete this form:</p>' +
//                             '<a href=' + config.clientUrl + 'reset/' + user.id + '/' + token + '">' + config.clientUrl + 'reset/' + user.id + '/' + token + '</a>' +
//                             '<br><br>' +
//                             '<p>--Team</p>'
//                         }
//                         let mailSent = sendMail(mailOptions)//sending mail to the user where he can reset password.User id and the token generated are sent as params in a link
//                         if (mailSent) {
//                             return res.json({success: true, message: 'Check your mail to reset your password.'})
//                         } else {
//                             return throwFailed(error, 'Unable to send email.');
//                         }
//                     })
//                 })
//             });
//         })
//  })

module.exports = router;