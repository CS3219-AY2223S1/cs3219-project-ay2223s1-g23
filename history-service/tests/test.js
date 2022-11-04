// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';

// Configure chai
chai.use(chaiHttp);
chai.should();

var expect = chai.expect;

describe("Questions", () => {
    // describe("GET: randomly select question", () => {
    //     let difficulty = "easy";
    //     it("get question from easy", (done) => {
    //         difficulty = "easy";
    //         getQuestionByDiffRequest(difficulty, done);
    //     });

    //     it("get question from medium", (done) => {
    //         difficulty = "medium";
    //         getQuestionByDiffRequest(difficulty, done);
    //     });

    //     it("get question from hard", (done) => {
    //         difficulty = "hard";
    //         getQuestionByDiffRequest(difficulty, done);
    //     });
    // });
});