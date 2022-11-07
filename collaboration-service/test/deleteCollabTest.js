import { expect } from "chai";
import { clearAll } from "../model/repository.js";
import app from "../index.js";
import request from "supertest";
import { DELETE_PATH } from "../config.js";
import { createCollab } from "./createCollabTest.js";

const TIMEOUT = 3000;

describe("Delete Collab API Test", function () {
  this.timeout(TIMEOUT);
  var res;

  beforeEach(async () => {
    await clearAll();
  });

  after(async () => {
    await clearAll();
  });

  it("delete existing collab model", async () => {
    await createCollab("a", "b", "a_b", "hard", "abcx");
    res = await deleteCollab("a_b");

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "message",
      "Collab successfully removed!"
    );
  });

  it("delete not existing collab model", async () => {
    await createCollab("a", "b", "a_b", "hard", "abcx");
    await deleteCollab("a_b");
    res = await deleteCollab("a_b");

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Collab a_b does not exist!");
    expect(res.body).to.have.property("data", false);

    res = await deleteCollab("c_d");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Collab c_d does not exist!");
    expect(res.body).to.have.property("data", false);
  });
});

export async function deleteCollab(roomId) {
  return await request(app).delete(DELETE_PATH.replace(":roomId", roomId));
}
