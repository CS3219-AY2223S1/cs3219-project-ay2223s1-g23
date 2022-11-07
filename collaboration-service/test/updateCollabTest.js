import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { UPDATE_PATH } from "../config.js";
import { createCollab } from "./createCollabTest.js";

const TIMEOUT = 3000;

describe("Update Collab API Test", function () {
  this.timeout(TIMEOUT);
  var res;

  beforeEach(async () => {
    await clearAll();
    await createCollab("a", "b", "a_b", "hard", "abcx");
  });

  after(async () => {
    await clearAll();
  });

  it("update existing collab success", async () => {
    res = await updateCollab("c", "d", "a_b", "easy", "");
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property(
      "message",
      "Updated collab a_b successfully!"
    );
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("_id");
    expect(res.body.data).to.have.property("user1", "c");
    expect(res.body.data).to.have.property("user2", "d");
    expect(res.body.data).to.have.property("roomId", "a_b");
    expect(res.body.data).to.have.property("difficulty", "easy");
    expect(res.body.data).to.have.property("text", "");

    res = await updateCollab(null, "", "a_b", "medium", null);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property(
      "message",
      "Updated collab a_b successfully!"
    );
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("_id");
    expect(res.body.data).to.have.property("user1", null);
    expect(res.body.data).to.have.property("user2", "");
    expect(res.body.data).to.have.property("roomId", "a_b");
    expect(res.body.data).to.have.property("difficulty", "medium");
    expect(res.body.data).to.have.property("text", null);

    res = await await request(app).put(UPDATE_PATH).send({
      user1: "a",
      roomId: "a_b",
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property(
      "message",
      "Updated collab a_b successfully!"
    );
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("_id");
    expect(res.body.data).to.have.property("user1", "a");
    expect(res.body.data).to.have.property("user2", "");
    expect(res.body.data).to.have.property("roomId", "a_b");
    expect(res.body.data).to.have.property("difficulty", "medium");
    expect(res.body.data).to.have.property("text", null);
  });

  it("update not existing collab", async () => {
    res = await updateCollab("c", "d", "c_d", "easy", "");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Could not update collab!");
  });

  it("missing update parameters", async () => {
    res = await updateCollab("c", "d", null, "easy", "");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Room ID is missing!");
  });
});

export async function updateCollab(user1, user2, roomId, difficulty, text) {
  return await request(app).put(UPDATE_PATH).send({
    user1,
    user2,
    roomId,
    difficulty,
    text,
  });
}
