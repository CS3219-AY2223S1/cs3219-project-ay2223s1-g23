import { createUser, existsUser, getPassword, updateUser, getEmail } from './repository.js';
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import "dotenv/config";
import nodemailer from "nodemailer";

//need to separate orm functions from repository to decouple business logic from persistence
export async function ormCreateUser(username, email, password) {
    try {
        if (await existsUser(username)) {
            return false;
        } else {
            const encryptedPassword = await bcrypt.hash(password, 10);
            const newUser = await createUser({
                username,
                email: email,
                password: encryptedPassword,
            });
            newUser.save();
            return true;
        }
    } catch (err) {
        console.log('ERROR: Could not create new user');
        return { err };
    }
}

export async function ormLoginUser(username, password) {
    try {
        if (await existsUser(username)) {
            const encryptedPassword = await getPassword(username);
            if (await bcrypt.compare(password, encryptedPassword)) {
                const token = generateAccessToken({ username });
                return { jwt: token };
            } else {
                return { err: "The password provided is inaccurate!" };
            }
        } else {
            return { err: "User does not exist!" };
        }
    } catch (err) {
        console.log("ERROR: Could not login user");
        return { err };
    }
}

export async function ormForgetPassword(username) {
    // Make sure user exist
    if (!await existsUser(username)) {
        return { err: "User does not exist!"};
    }

    // create a One time link for 15 min 
    const currPassword = await getPassword(username);
    const secret = process.env.JWT_SECRET + currPassword;
    const payload = {
        username: username
    };

    const token = jwt.sign(payload, secret, {expiresIn: '15m'});
    // TODO: change the link and send email instead of console
    try {
        const link = `http://localhost:8000/api/user/reset-password/${username}/${token}`;
        console.log(link);
        const userEmail = await getEmail(username);
        sendLink(userEmail,link);
        return { message: 'Reset link has been sent to your email.'};
    } catch (err) {
        return { message: 'Fail to send the reset link. Please try again later.'};
    } 
}

export async function ormVerifyResetPassword(username, token) {
    // check if user exist in data base
    if (!await existsUser(username)) {
        console.log('Invalid user...');
        return false;
    }

    const currPassword = await getPassword(username);
    const secret = process.env.JWT_SECRET + currPassword;
    try {
        const payload = jwt.verify(token, secret);
        return true;
    } catch (err) {
        console.log(err.message);
        return {err};
    }
}

export async function ormResetPassword(username, token, password, confirmPassword) {
    // check if user exist in data base
    if (!await existsUser(username)) {
        console.log('Invalid id...');
        return false;
    }

    const currPassword = await getPassword(username);
    const secret = process.env.JWT_SECRET + currPassword;
    try {
        const payload = jwt.verify(token, secret);

        // hash password
        const encryptedPassword = await bcrypt.hash(password, 10);
        
        //validate password and confirm password match
        if (!await bcrypt.compare(confirmPassword, encryptedPassword)) {
            return false;
        }
        await updateUser(username, {password: encryptedPassword});

        return true;
    } catch (error) {
        console.log(error.message);
        return {err};
    }
}

function generateAccessToken(username) {
    console.log(username)
    return jwt.sign(username, process.env.JWT_SECRET, { expiresIn: "1800s" });
}

function sendLink(userEmail, link) {
    const text = `Hello,This email has been sent to you so you can reset your login account password. 
Please click the link below to complete the password reset process. This link will expire in 15 minutes.
                
${link}

Received this message by mistake?
You may have received this email in error 
because another customer entered this email address by mistake.
If you received this message by mistake, please delete this email.

────────────────
PeerPressure`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "[PeerPreasure] Password reset",
        text: text
    };

    const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    transporter.sendMail(mailOptions);
}
