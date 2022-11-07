import { expect } from "chai";
import { clearAllUser, getUser } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import jwt from "jsonwebtoken";
import { DELETE_PATH } from "../config.js";
import userModel from "../model/user-model.js";

const TIMEOUT=4000;

describe("Delete User API Test", function() {
    const fix_username = "test";
    const fix_email = "test@gmail.com";
    const fix_password = "test";
    var token;
    var res;

    this.timeout(TIMEOUT);

    beforeEach(async () => {
        await clearAllUser();
        const newUser = new userModel({username: fix_username, email: fix_email, password: fix_password});
        await newUser.save();
        const user = await getUser(fix_username);
        token = await generateAccessToken(user.toJSON());
    });

    afterEach(async () => {
        await clearAllUser();
    });

    describe ("Succcess delete", () => {
        it("valid verification", async () => {
            res = await deleteUser(fix_username, token);
            expect(res.status).to.equal(200);
            
            expect(res.body).to.have.property(
                "message",
                "User successfully removed!"
            );
        });
    });

    describe ("Fail delete", () => {
        it("user not exist", async () => {
            res = await deleteUser("invalidUsername", token); 
            console.log(res.body);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property(
                "message",
                "User not found!"
            );
        });

        it("no authentication", async () => {
            res = await request(app).delete("/api/user/" + DELETE_PATH.replace(":username", fix_username));

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property(
                "message",
                "A token is required for authentication!"
            );
        });
    
        it("invalid authentication", async () => {
            res = await deleteUser(fix_username, "invalidToken"); 

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property(
                "message",
                "Invalid token provided!"
            );
        });
    });
});

async function deleteUser(username, token) {
    return await request(app)
        .delete("/api/user/" + DELETE_PATH.replace(":username", username))
        .set({Authorization: "Bearer " + token});
};

async function generateAccessToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1800s" });
}
