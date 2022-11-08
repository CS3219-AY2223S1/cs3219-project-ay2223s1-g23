// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import MatchModel from "../src/model/match-model"

// Configure chai
chai.use(chaiHttp);
chai.should();

const matching_url = "/difficulties";
var expect = chai.expect;
const createMatch = (difficulty, done) => {
    chai.request(app)
        .post(matching_url)
        .type("form")
        .send({
            userId: "userId1",
            difficulty: difficulty
        })
        .end(async function (err, res) {
            await MatchModel.findByIdAndDelete(res.body.data._id);
            res.should.have.status(201);
            expect(res.body.data.userId).to.be.string("userId1");
            expect(res.body.data.difficulty).to.be.string(difficulty);
            expect(res.body.data.matchedUser).to.be.null;
            done();
        })
}

describe("Matching", () => {
    it("POST: create matching with easy", (done) => {
        createMatch("easy", done);
    });

    it("POST: create matching with medium", (done) => {
        createMatch("medium", done);
    });

    it("POST: create matching with hard", (done) => {
        createMatch("hard", done);
    });

});