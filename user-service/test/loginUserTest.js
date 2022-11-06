import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { LOGIN_PATH } from "../config.js";


describe("User Login Test", () => {
    beforeEach(async() => {
        await clearAll();
    });

    afterEach(async () => {
        await clearAll();
    });

    describe ("Succcess Login", () => {
        it("login successfully", async () => {
            
        });
    });

    describe ("Fail Login", () => {
        it("user not exist", async () => {
        
        });
    
        it("wrong password", async () => {
            
        });
    });
});
