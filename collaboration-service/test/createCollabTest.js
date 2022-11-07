import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { CREATE_PATH } from "../config.js";

const TIMEOUT = 3000;

describe("Create Collab API Test", function () {
  this.timeout(TIMEOUT);
  var res;

  beforeEach(async () => {
    await clearAll();
  });

  after(async () => {
    await clearAll();
  });

  it("server is running", async () => {
    res = await request(app).get("/");
    expect(res.status).to.equal(200);
    expect(res).to.have.property("text", "Hello World from collab-service");
  });

  it("create valid collab model", async () => {
    res = await createCollab("a", "b", "a_b", "hard", "abcx");

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property(
      "message",
      "Created new collab a_b successfully!"
    );

    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("_id");
    expect(res.body.data).to.have.property("user1", "a");
    expect(res.body.data).to.have.property("user2", "b");
    expect(res.body.data).to.have.property("roomId", "a_b");
    expect(res.body.data).to.have.property("difficulty", "hard");
    expect(res.body.data).to.have.property("text", "abcx");
  });

  it("create repeated collab model", async () => {
    res = await createCollab("a", "b", "a_b", "hard", "abcx");
    res = await createCollab("a", "b", "a_b", "hard", "abcx");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "a_b already exists!");

    res = await createCollab("c", "d", "a_b", "easy", "abcd");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "a_b already exists!");
  });

  it("create with missing parameter", async () => {
    res = await createCollab(null, "b", "a_b", "hard", "abcx");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "User IDs and/or room ID and/or difficulty are missing!"
    );

    res = await createCollab("a", null, "a_b", "hard", "abcx");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "User IDs and/or room ID and/or difficulty are missing!"
    );

    res = await createCollab("a", "b", null, "hard", "abcx");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "User IDs and/or room ID and/or difficulty are missing!"
    );

    res = await createCollab("a", "b", "a_b", null, "abcx");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "User IDs and/or room ID and/or difficulty are missing!"
    );

    res = await createCollab(null, null, null, null, null);
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "User IDs and/or room ID and/or difficulty are missing!"
    );
  });
});

export async function createCollab(user1, user2, roomId, difficulty, text) {
  return await request(app).post(CREATE_PATH).send({
    user1,
    user2,
    roomId,
    difficulty,
    text,
  });
}
