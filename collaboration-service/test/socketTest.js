import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";
import { assert } from "chai";
import { initSocketEventHandlers } from "../controller/socketController.js";

var options = {
  transports: ["websocket"],
  "force new connection": true,
};

let EMIT_WAIT_TIME = 500;

describe("collaboration-service socket test", function () {
  this.timeout(EMIT_WAIT_TIME * 10);
  let io, clientSocket1, clientSocket2, clientSocket3, clientSocket4;

  before((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;

      io.on("connection", (socket) => {
        initSocketEventHandlers(socket, io);
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

  it("send join room", (done) => {
    io.of("/").adapter.on("join-room", (room, id) => {
      assert.equal(room, "room 1");
      assert.equal(id, clientSocket1.id);
      done();
    });
    clientSocket1.emit("join_room", "room 1");
  });

  it("send changes", async () => {
    var client1Msg = [];
    var client2Msg = [];
    var client3Msg = [];
    var client4Msg = [];
    var content1 = {
      roomId: "room 1",
      delta: "delta 1",
    };
    var content2 = {
      roomId: "room 1",
      delta: "delta 2",
    };
    var content3 = {
      roomId: "room 2",
      delta: "delta 1",
    };
    var content4 = {
      roomId: "room 2",
      delta: "delta 2",
    };

    clientSocket1.on("receive-changes", function (data) {
      client1Msg.push(data);
    });
    clientSocket2.on("receive-changes", function (data) {
      client2Msg.push(data);
    });
    clientSocket3.on("receive-changes", function (data) {
      client3Msg.push(data);
    });
    clientSocket4.on("receive-changes", function (data) {
      client4Msg.push(data);
    });

    clientSocket1.emit("join_room", "room 1");
    clientSocket2.emit("join_room", "room 1");
    clientSocket3.emit("join_room", "room 2");
    clientSocket4.emit("join_room", "room 2");

    await sleep(EMIT_WAIT_TIME);

    clientSocket1.emit("send-changes", content1);

    await sleep(EMIT_WAIT_TIME);

    clientSocket2.emit("send-changes", content2);

    await sleep(EMIT_WAIT_TIME);

    clientSocket3.emit("send-changes", content3);

    await sleep(EMIT_WAIT_TIME);

    clientSocket4.emit("send-changes", content4);

    await sleep(EMIT_WAIT_TIME);

    assert.equal(
      JSON.stringify(client1Msg),
      JSON.stringify(["delta 2"])
    );
    assert.equal(
      JSON.stringify(client2Msg),
      JSON.stringify(["delta 1"])
    );
    assert.equal(
      JSON.stringify(client3Msg),
      JSON.stringify(["delta 2"])
    );
    assert.equal(
      JSON.stringify(client4Msg),
      JSON.stringify(["delta 1"])
    );
  });
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
