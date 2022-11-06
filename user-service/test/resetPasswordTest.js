import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { RESET_PASSWORD_PATH } from "../config.js";


describe("User resetPassword Test", () => {
    beforeEach(async() => {
        await clearAll();
    });

    afterEach(async () => {
        await clearAll();
    });

    describe ("Succcess Reset", () => {
        it("valid link", async () => {
            
        });
    });

    describe ("Fail Reset", () => {
        it("user not exist", async () => {
        
        });
    
        it("invalid link", async () => {
            
        });
    });
});
