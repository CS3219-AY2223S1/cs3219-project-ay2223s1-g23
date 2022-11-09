// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import QuestionModel from "../model/question-model"

// Configure chai
chai.use(chaiHttp);
chai.should();

var expect = chai.expect;
const ques_url = "/ques";
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
        beforeEach(async () => {
            await new QuestionModel({
                "title": "test1",
                "body": "test1",
                "difficulty": "easy",
                "url": "url.com/test1",
            }).save();;

            await new QuestionModel({
                "title": "test2",
                "body": "test2",
                "difficulty": "medium",
                "url": "url.com/test2",
            }).save();;

            await new QuestionModel({
                "title": "test3",
                "body": "test3",
                "difficulty": "hard",
                "url": "url.com/test3",
            }).save();;
        });

        afterEach(async () => {
            await QuestionModel.deleteMany({});
        });

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

    describe("POST: create new question", () => {
        it("create easy question", (done) => {
            chai.request(app)
                .post(ques_url)
                .type("form")
                .send({
                    "title": "title1",
                    "body": "body1",
                    "difficulty": "easy",
                    "url": "url.com/title1",
                })
                .end(async function (err, res) {
                    await QuestionModel.findByIdAndDelete(res.body.data._id);
                    res.should.have.status(201);
                    expect(res.body.data.difficulty).to.be.string("easy")
                    done();
                })
        });

        it("create medium question", (done) => {
            chai.request(app)
                .post(ques_url)
                .type("form")
                .send({
                    "title": "title2",
                    "body": "body2",
                    "difficulty": "medium",
                    "url": "url.com/title2",
                })
                .end(async function (err, res) {
                    await QuestionModel.findByIdAndDelete(res.body.data._id);
                    res.should.have.status(201);
                    expect(res.body.data.difficulty).to.be.string("medium")
                    done();
                })
        });

        it("create hard question", (done) => {
            chai.request(app)
                .post(ques_url)
                .type("form")
                .send({
                    "title": "title3",
                    "body": "body3",
                    "difficulty": "hard",
                    "url": "url.com/title3",
                })
                .end(async function (err, res) {
                    await QuestionModel.findByIdAndDelete(res.body.data._id);
                    res.should.have.status(201);
                    expect(res.body.data.difficulty).to.be.string("hard")
                    done();
                })
        });

        it("Error: difficulty is not easy, medium or hard", (done) => {
            chai.request(app)
                .post(ques_url)
                .type("form")
                .send({
                    "title": "title4",
                    "body": "body4",
                    "difficulty": "ha",
                    "url": "url.com/title4",
                })
                .end(async function (err, res) {
                    res.should.have.status(400);
                    done();
                })
        });

    })
});