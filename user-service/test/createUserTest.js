import { expect } from "chai";
import { clearAllUser } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { CREATE_PATH } from "../config.js";

const TIMEOUT=5000;

describe("Create User API Test", function () {
    this.timeout(TIMEOUT);
    var res;

    beforeEach(async() => {
        await clearAllUser();
    });

    afterEach(async () => {
        await clearAllUser();
    });

    describe ("Succcess Create", () => {
        it("normal valid input", async () => {
            res = await createUser("test1", "test1@email.com", "test1");

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property(
                "message",
                "Created new user test1 successfully!"
            );
        });

        it("repeated email", async () => {
            await createUser("test1", "test1@email.com", "test1");
            res = await createUser("test2", "test1@email.com", "test2");

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property(
                "message",
                "Created new user test2 successfully!"
            );
        });

        it("repeated password", async () => {
            await createUser("test1", "test1@email.com", "test");
            res = await createUser("test2", "test2@email.com", "test");

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property(
                "message",
                "Created new user test2 successfully!"
            );
        });
    });

    describe ("Fail create with invalid input", () => {
        it("username alredy exist", async () => {
            const created = await createUser("test1", "test1@email.com", "test1");
            await sleep(500);
            res = await createUser("test1", "test1@email.com", "test1");

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "username",
                "test1 already exists!"
            );
        });
    
        it("invalid email", async () => {
            res = await createUser("test1", "test1", "test1");
            
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "email",
                "Please provide a valid email address."
            );
        });
    });

    describe ("Fail create with missing field", () => {
        it("empty username", async () => {
            res = await createUser(null, "test1@email.com", "test1");

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "username",
                "Username is missing!"
            );
        });

        it("empty email", async () => {
            res = await createUser("test1", null, "test1");

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "email",
                "Email is missing!"
            );
        });
    
        it("empty password", async () => {
            res = await createUser("test1", "test1@email.com", null);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "password",
                "Password is missing!"
            );
        });
    
        it("all empty", async () => {
            res = await createUser(null, null, null);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("err");
            expect(res.body.err).to.have.property(
                "username",
                "Username is missing!"
            );
            expect(res.body.err).to.have.property(
                "email",
                "Email is missing!"
            );
            expect(res.body.err).to.have.property(
                "password",
                "Password is missing!"
            );
        });
        
    });
    
});

async function createUser(username, email, password) {
    return await request(app)
        .post(`/api/user${CREATE_PATH}`)
        .send({username: username, email: email, password: password});
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
