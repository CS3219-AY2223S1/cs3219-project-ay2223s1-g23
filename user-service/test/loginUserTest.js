import { expect } from "chai";
import { clearAllUser, createUser, getUser } from "../model/repository.js";
import app from "../index.js";
import userModel from "../model/user-model.js";
import request from "supertest";
import * as bcrypt from "bcrypt";
import { LOGIN_PATH } from "../config.js";

const TIMEOUT=3000;

describe("User Login Test",  function () {
    const fix_username = "test";
    const fix_email = "test@email.com";
    const fix_password = "test";
    var fix_encrypted_password;
    var res;

    this.timeout(TIMEOUT);

    beforeEach(async () => {
        await clearAllUser();
        fix_encrypted_password = await bcrypt.hash(fix_password, 10);
        const newUser = await createUser({username: fix_username, email: fix_email, password: fix_encrypted_password});
        await newUser.save();
        newUser.save();
        const user = await getUser(fix_username);
    });

    afterEach(async () => {
        await clearAllUser();
    });

    describe ("Succcess Login", () => {
        it("login successfully", async () => {

            res = await loginUser(fix_username, fix_password);
            console.log(res.body);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("jwt");
        });
    });

    describe ("Fail Login", () => {
        it("user not exist", async () => {
            const res = await loginUser("inalidUsername", fix_encrypted_password);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "username",
                "User does not exist!"
            );
        });
    
        it("wrong password", async () => {
            const res = await loginUser(fix_username, "wrong_password");

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "password",
                "The password provided is inaccurate!"
            );
        });

        it("missing username", async () => {
            const res = await loginUser(null, fix_encrypted_password);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "username",
                "Username is missing!"
            );
        });
    
        it("missing password", async () => {
            const res = await loginUser(fix_username, null);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "password",
                "Password is missing!"
            );
        });

        it("missing all", async () => {
            const res = await loginUser(null, null);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "username",
                "Username is missing!"
            );
            expect(res.body.err).to.have.property(
                "password",
                "Password is missing!"
            );
        });
    });
});

async function loginUser(username, password) {
    return await request(app)
        .post("/api/user" + LOGIN_PATH)
        .send({username, password});
};
