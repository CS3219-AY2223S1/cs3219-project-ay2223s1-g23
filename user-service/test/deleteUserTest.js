import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { DELETE_PATH } from "../config.js";


describe("Delete User API Test", () => {
    beforeEach(async() => {
        await clearAll();
    });

    afterEach(async () => {
        await clearAll();
    });

    describe ("Succcess delete", () => {
        it("valid verification", async () => {
            
        });
    });

    describe ("Fail delete", () => {
        it("user not exist", async () => {
        
        });
    
        it("invalid varification", async () => {
            
        });
    });
});
