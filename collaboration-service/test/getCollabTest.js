import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { GET_PATH } from "../config.js";
import { createCollab } from "./createCollabTest.js";
import { deleteCollab } from "./deleteCollabTest.js";

const TIMEOUT = 3000;

describe("Get Collab API Test", function () {
  this.timeout(TIMEOUT);
  var res;

  beforeEach(async () => {
    await clearAll();
  });

  after(async () => {
    await clearAll();
  });

  it("get existing collab model", async () => {
    await createCollab("a", "b", "a_b", "hard", "abcx");
    await createCollab("c", "d", "c_d", "easy", null);

    res = await getCollab("a_b");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "message",
      "Collab successfully fetched!"
    );
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("_id");
    expect(res.body.data).to.have.property("user1", "a");
    expect(res.body.data).to.have.property("user2", "b");
    expect(res.body.data).to.have.property("roomId", "a_b");
    expect(res.body.data).to.have.property("difficulty", "hard");
    expect(res.body.data).to.have.property("text", "abcx");

    res = await getCollab("c_d");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "message",
      "Collab successfully fetched!"
    );
    expect(res.body).to.have.property("data");
    expect(res.body.data).to.have.property("_id");
    expect(res.body.data).to.have.property("user1", "c");
    expect(res.body.data).to.have.property("user2", "d");
    expect(res.body.data).to.have.property("roomId", "c_d");
    expect(res.body.data).to.have.property("difficulty", "easy");
    expect(res.body.data).to.have.property("text", "");
  });

  it("get not existing collab model", async () => {
    await createCollab("a", "b", "a_b", "hard", "abcx");

    res = await getCollab("c_d");
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("message", "Collab not found!");

    await deleteCollab("a_b");
    res = await getCollab("a_b");

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("message", "Collab not found!");
  });
});

export async function getCollab(roomId) {
  return await request(app).get(GET_PATH.replace(":roomId", roomId));
}
