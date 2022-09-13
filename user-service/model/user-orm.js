import { createUser, deleteUser, existsUser, getPassword } from './repository.js';
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import "dotenv/config";

//need to separate orm functions from repository to decouple business logic from persistence
export async function ormCreateUser(username, password) {
    try {
        if (await existsUser(username)) {
            return false;
        } else {
            const encryptedPassword = await bcrypt.hash(password, 10);
            const newUser = await createUser({
                username,
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
    console.log("hello9");
    if (!await existsUser(username)) {
        return false;
    }
    console.log("hello0");
    try {
        console.log("hello");
        await deleteUser(username);
        console.log("hello2");
        return true;
    } catch (err) {
        console.log("ERROR: Could not delete user");
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

function generateAccessToken(username) {
    console.log(username)
    return jwt.sign(username, process.env.JWT_SECRET, { expiresIn: "1800s" });
}
