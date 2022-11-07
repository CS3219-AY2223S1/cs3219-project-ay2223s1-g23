import { expect } from "chai";
import { clearAllUser, createUser } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { FORGET_PASSWORD_PATH } from "../config.js";


describe("User forget password test", function () {
    const fix_username = "test";
    const fix_email = "test@gmail.com";
    const fix_password = "test";
    var res;

    beforeEach(async() => {
        await clearAllUser();
        const newUser = await createUser({username: fix_username, email: fix_email, password: fix_password});
        await newUser.save();
    });

    afterEach(async () => {
        await clearAllUser();
    });

    it(" success with valid input", async () => {
        res = await forgetPasswordUser(fix_username); 

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property(
            "msg",
            "Reset link has been sent to your email."
        );
        
    });

    it("fail with user not exist", async () => {
        res = await forgetPasswordUser("invalidUsername"); 
    
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property(
            "message",
            "User does not exist!"
        );
    });

    it("fail with empty input", async () => {
        res = await forgetPasswordUser(null);
        
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property(
            "message",
            "Username is missing!"
        );
    });
});

async function forgetPasswordUser(username) {
    return await request(app)
        .post("/api/user/" + FORGET_PASSWORD_PATH)
        .send({username: username});
};
