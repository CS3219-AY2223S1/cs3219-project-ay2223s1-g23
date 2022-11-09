import { expect } from "chai";
import { clearAllUser, createUser, getPassword } from "../model/repository.js";
import app from "../index.js";
import jwt from "jsonwebtoken";
import request from "supertest";
import { RESET_PASSWORD_PATH } from "../config.js";


describe("User resetPassword Test", function () {
    const fix_username = "test";
    const fix_email = "test@email.com";
    const fix_password = "test";
    const update_password = "update";
    var res;
    var token;

    beforeEach(async () => {
        await clearAllUser();
        const newUser = await createUser({username: fix_username, email: fix_email, password: fix_password});
        await newUser.save();
        newUser.save();

        const oldPassword = await getPassword(fix_username);
        const secret = process.env.JWT_SECRET + oldPassword;
        const payload = {
            username: fix_username
        };
        token = await jwt.sign(payload, secret, {expiresIn: '10s'});
    });

    afterEach(async () => {
        await clearAllUser();
    });

    describe ("Succcess Reset", () => {
        it("valid link", async () => {
            res = await resetPasswordUser(fix_username, update_password, update_password, token);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property(
                "message",
                "Password updated successfully!"
            );
        });
    });

    describe ("Fail Reset", () => {
        it("wrong user name", async () => {
            res = await resetPasswordUser("invalidUsername", update_password, update_password, token);

            expect(res.status).to.equal(400);
        });

        it("password not match", async () => {
            res = await resetPasswordUser(fix_username, update_password, "anotherPassword", token);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                "message",
                "Password does not match!"
            );
        });

        it("wrong token", async () => {
            res = await resetPasswordUser(fix_username, update_password, update_password, "invalidToken");

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                "message",
                "Fail to reset password!"
            );
        });
    });

    describe ("Invalid input", () => {
        it("missing username", async () => {
            res = await resetPasswordUser(null, update_password, update_password, token);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                "message",
                "Fail to reset password!"
            );
        });
    
        it("missing password", async () => {
            res = await resetPasswordUser(fix_username, null, update_password, token);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                "message",
                "Password and/or Confirm Password is missing!"
            );
        });

        it("missing confirm password", async () => {
            res = await resetPasswordUser(fix_username, update_password, null, token);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                "message",
                "Password and/or Confirm Password is missing!"
            );
        });

        it("missing all", async () => {
            res = await resetPasswordUser(null, null, null, token)

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                "message",
                "Password and/or Confirm Password is missing!"
            );
        });
    });
});

async function resetPasswordUser(username, password, confirmPassword, token) {
    return await request(app)
        .put("/api/user/" + RESET_PASSWORD_PATH.replace(":token", token))
        .send({username: username, newPassword: password, confirmNewPassword: confirmPassword});
};
