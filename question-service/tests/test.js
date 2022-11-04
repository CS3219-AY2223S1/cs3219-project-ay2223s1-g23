// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';

// Configure chai
chai.use(chaiHttp);
chai.should();

var expect = chai.expect;
const ques_url = "/q";
const getQuestionByDiffRequest = (difficulty, done) => {
    chai.request(app)
        .get(`${ques_url}/diff?diff=${difficulty}`)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            expect(res.body.data.difficulty).to.be.string(difficulty)
            done();
        });
}

describe("Questions", () => {
    describe("GET: randomly select question", () => {
        let difficulty = "easy";
        it("get question from easy", (done) => {
            difficulty = "easy";
            getQuestionByDiffRequest(difficulty, done);
        });

        it("get question from medium", (done) => {
            difficulty = "medium";
            getQuestionByDiffRequest(difficulty, done);
        });

        it("get question from hard", (done) => {
            difficulty = "hard";
            getQuestionByDiffRequest(difficulty, done);
        });
    });
});