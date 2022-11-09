import { createUser, existsUser, getPassword, updateUser, getEmail, deleteUser, getUser } from './repository.js';
import * as EmailValidator from 'node-email-validation';
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import "dotenv/config";
import nodemailer from "nodemailer";

//need to separate orm functions from repository to decouple business logic from persistence
export async function ormCreateUser(username, email, password) {
    try {
        const error = { err: {} };
        if (await existsUser(username)) {
            error.err.username = `${username} already exists!`;
        }
        
        if (!EmailValidator.is_email_valid(email)) {
            error.err.email = "Please provide a valid email address.";
        } 
        
        if (error.err.username || error.err.email) {
            return error;
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

export async function ormDeleteUser(username) {
    if (!await existsUser(username)) {
        return false;
    }
    try {
        await deleteUser(username);
        return true;
    } catch (err) {
        console.log("ERROR: Could not delete user");
        return { err };
    }
}

export async function ormLoginUser(username, password) {
    try {
        const error = { err: {} };
        if (!await existsUser(username)) {
            error.err.username = "User does not exist!";
            return error;
        }

        const encryptedPassword = await getPassword(username);
        if (!await bcrypt.compare(password, encryptedPassword)) {
            error.err.password = "The password provided is inaccurate!";
            return error;
        } 
        
        const userDetail = await getUser(username);
        const token = generateAccessToken(userDetail.toJSON());
        return { jwt: token };
    } catch (err) {
        console.log("ERROR: Could not login user");
        return { err };
    }
}

export async function ormForgetPassword(username) {
    if (!await existsUser(username)) {
        return { err: "User does not exist!"};
    }

    // create a One time link for 15 min 
    const oldPassword = await getPassword(username);
    const secret = process.env.JWT_SECRET + oldPassword;
    const payload = {
        username: username
    };

    const token = jwt.sign(payload, secret, {expiresIn: '15m'});
    try {
        const URI_FRONTEND = process.env.URI_FRONTEND || "http://localhost:3000";
        const link = URI_FRONTEND + `/reset-password/${token}`;
        console.log(link);
        const userEmail = await getEmail(username);
        sendLink(userEmail,link);
        return { message: 'Reset link has been sent to your email.'};
    } catch (err) {
        return { message: 'Fail to send the reset link. Please try again later.'};
    } 
}

export async function ormResetPassword(username, token, password, confirmPassword) {
    // check if user exist in data base
    if (!await existsUser(username)) {
        console.log('Invalid id...');
        return { err: "User does not exist!" };
    }

    const oldPassword = await getPassword(username);
    const secret = process.env.JWT_SECRET + oldPassword;
    try {
        const payload = jwt.verify(token, secret);

        const encryptedPassword = await bcrypt.hash(password, 10);  
        if (!await bcrypt.compare(confirmPassword, encryptedPassword)) {
            return false;
        }
        await updateUser(username, {password: encryptedPassword});

        return true;
    } catch (error) {
        console.log(error.message);
        return {err: error.message};
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
