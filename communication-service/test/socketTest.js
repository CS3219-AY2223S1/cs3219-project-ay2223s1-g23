import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";
import { assert } from "chai";
import { initSocketEventHandlers } from "../src/controllers/socketController.js";

var options = {
  transports: ["websocket"],
  "force new connection": true,
};

let EMIT_WAIT_TIME = 500;

describe("communication-service socket test", function () {
  this.timeout(EMIT_WAIT_TIME * 10);
  let io, clientSocket1, clientSocket2, clientSocket3, clientSocket4;

  before((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;

      io.on("connection", (socket) => {
        initSocketEventHandlers(socket);
      });
      clientSocket1 = new Client(`http://localhost:${port}`, options);
      clientSocket1.on("connect", () => {
        clientSocket2 = new Client(`http://localhost:${port}`, options);
        clientSocket2.on("connect", () => {
          clientSocket3 = new Client(`http://localhost:${port}`, options);
          clientSocket3.on("connect", () => {
            clientSocket4 = new Client(`http://localhost:${port}`, options);
            clientSocket4.on("connect", done);
          });
        });
      });
    });
  });

  afterEach(() => {
    io.of("/").adapter.removeAllListeners();
    clientSocket1.removeAllListeners();
    clientSocket2.removeAllListeners();
    clientSocket3.removeAllListeners();
    clientSocket4.removeAllListeners();
  });

  after(() => {
    io.close();
    clientSocket1.disconnect();
    clientSocket2.disconnect();
    clientSocket3.disconnect();
    clientSocket4.disconnect();
    clientSocket1.close();
    clientSocket2.close();
    clientSocket3.close();
    clientSocket4.close();
  });

  it("send userInfo with join room", (done) => {
    io.of("/").adapter.on("join-room", (room, id) => {
      assert.equal(room, "room 1");
      assert.equal(id, clientSocket1.id);
      done();
    });
    clientSocket1.emit("userInfo", { roomId: "room 1", online: true });
  });

  it("send userInfo with leave room", (done) => {
    io.of("/").adapter.on("leave-room", (room, id) => {
      assert.equal(id, clientSocket1.id);
      assert.equal(room, "room 2");
      done();
    });
    clientSocket1.emit("userInfo", { roomId: "room 2", online: true });
    clientSocket1.emit("userInfo", { roomId: "room 2", online: false });
  });

  it("send userInfo with no room Id", async () => {
    io.of("/").adapter.on("leave-room", (room, id) => {
      assert.fail("Unexpected leave room");
    });
    io.of("/").adapter.on("join-room", (room, id) => {
      assert.fail("Unexpected join room");
    });

    clientSocket1.emit("userInfo", { roomId: "", online: true });
    clientSocket1.emit("userInfo", { roomId: "", online: false });

    await sleep(EMIT_WAIT_TIME);
  });

  it("send voice", async () => {
    var client1CallCount = 0;
    var client2CallCount = 0;
    var client3CallCount = 0;
    var client4CallCount = 0;

    clientSocket1.on("send", function (data) {
      assert.equal(data, "data:audio/ogg;test");
      client1CallCount++;
    });
    clientSocket2.on("send", function (data) {
      assert.equal(data, "data:audio/ogg;test");
      client2CallCount++;
    });
    clientSocket3.on("send", function (data) {
      assert.equal(data, "data:audio/ogg;test");
      client3CallCount++;
    });
    clientSocket4.on("send", function (data) {
      assert.equal(data, "data:audio/ogg;test");
      client4CallCount++;
    });

    clientSocket1.emit("userInfo", { roomId: "room1", online: true });
    clientSocket2.emit("userInfo", { roomId: "room1", online: true });
    clientSocket3.emit("userInfo", { roomId: "room2", online: true });
    clientSocket4.emit("userInfo", { roomId: "room2", online: false });

    await sleep(EMIT_WAIT_TIME);

    clientSocket1.emit("voice", "voice;test");

    await sleep(EMIT_WAIT_TIME);

    assert.equal(client1CallCount, 0, "speaker hears himself");
    assert.equal(client2CallCount, 1);
    assert.equal(client3CallCount, 0, "person in other room should not hear");
    assert.equal(client4CallCount, 0, "person not in any call should not hear");

    clientSocket4.emit("userInfo", { roomId: "room2", online: true });

    await sleep(EMIT_WAIT_TIME);

    clientSocket1.emit("voice", "voice;test");
    clientSocket2.emit("voice", "voice;test");
    clientSocket3.emit("voice", "voice;test");

    await sleep(EMIT_WAIT_TIME);

    assert.equal(client1CallCount, 1);
    assert.equal(client2CallCount, 2);
    assert.equal(client3CallCount, 0);
    assert.equal(client4CallCount, 1);
  });
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
