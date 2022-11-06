import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { CREATE_PATH } from "../config.js";


describe("Create User API Test", () => {
    beforeEach(async() => {
        await clearAll();
    });

    afterEach(async () => {
        await clearAll();
    });

    describe ("Succcess Create", () => {
        it("normal valid input", async () => {
            
        });

        it("repeated email", async () => {
            
        });

        it("repeated password", async () => {
            
        });
    });

    describe ("Fail create with invalid input", () => {
        it("username alredy exist", async () => {
        
        });
    
        it("invalid email", async () => {
            
        });
    });

    describe ("Fail create with missing field", () => {
        it("empty username", async () => {
        
        });

        it("empty email", async () => {
            
        });
    
        it("empty password", async () => {
            
        });

        it("empty username & password", async () => {
        
        });

        it("empty email & password", async () => {
            
        });
    
        it("all empty", async () => {
            
        });
        
    });
});
