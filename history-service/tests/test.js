// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import HistoryModel from "../model/history-model"

// Configure chai
chai.use(chaiHttp);
chai.should();

var expect = chai.expect;
const hist_url = "/h";

describe("Histories", () => {
    let historyModel;
    let historyId;
    beforeEach(async () => {
        historyModel = await new HistoryModel({
            quesId: "quesId1",
            userId1: "userId1",
            userId2: "userId2",
            answer: "answer1"
        }).save();;
        historyId = await (await HistoryModel.findOne(historyModel))._id;
    });

    afterEach(async () => {
        await HistoryModel.deleteOne(historyModel);
    });

    it("GET: history by userId", (done) => {
        chai.request(app)
            .get(`${hist_url}/userId?userId=userId1`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.should.be.a('array');
                expect(res.body.data[0].quesId).to.be.string("quesId1");
                expect(res.body.data[0].userId1).to.be.string("userId1");
                expect(res.body.data[0].userId2).to.be.string("userId2");
                expect(res.body.data[0].answer).to.be.string("answer1");
                done();
            });
    });

    it("GET: history by Id", (done) => {
        chai.request(app)
            .get(`${hist_url}/id?id=${historyId}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.should.be.a('object');
                expect(res.body.data.quesId).to.be.string("quesId1");
                expect(res.body.data.userId1).to.be.string("userId1");
                expect(res.body.data.userId2).to.be.string("userId2");
                expect(res.body.data.answer).to.be.string("answer1");
                done();
            });
    });

    it("POST: create new history", (done) => {
        chai.request(app)
            .post(hist_url)
            .type("form")
            .send({
                quesId: "quesId1",
                userId1: "userId1",
                userId2: "userId2"
            })
            .end(async function (err, res) {
                await HistoryModel.findByIdAndDelete(res.body.data._id);
                res.should.have.status(201);
                expect(res.body.data.quesId).to.be.string("quesId1");
                expect(res.body.data.userId1).to.be.string("userId1");
                expect(res.body.data.userId2).to.be.string("userId2");
                expect(res.body.data.answer).to.be.string("");
                done();
            })
    });
});