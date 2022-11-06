import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { FORGOT_PASSWORD_PATH } from "../config.js";


describe("User Login Test", () => {
    beforeEach(async() => {
        await clearAll();
    });

    afterEach(async () => {
        await clearAll();
    });

    it(" success with valid input", async () => {
        
    });

    it("fail with user not exist", async () => {
    
    });
});
