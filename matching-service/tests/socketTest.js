import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";
import { assert, expect } from "chai";
import { initSocketEventHandlers } from "../src/controllers/socketController";

var options = {
    transports: ["websocket"],
    "force new connection": true,
};

let EMIT_WAIT_TIME = 500;

describe("matching-service socket test", function () {
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

    it("match", async () => {
        var data1, data2;
        clientSocket1.on("match_success", function (data) {
            data1 = data;
        })
        clientSocket2.on("match_success", function (data) {
            data2 = data;
        })

        clientSocket1.emit("find_match", { userId: "1", difficulty: "easy" });

        await sleep(EMIT_WAIT_TIME);

        clientSocket2.emit("find_match", { userId: "2", difficulty: "easy" });

        await sleep(EMIT_WAIT_TIME);

        assert.equal(
            JSON.stringify(data1),
            JSON.stringify(data2)
        );
    });

    it("no match", async () => {
        var data1, data2;
        clientSocket1.on("match_success", function (data) {
            data1 = data;
        })
        clientSocket2.on("match_success", function (data) {
            data2 = data;
        })

        clientSocket1.emit("find_match", { userId: "1", difficulty: "easy" });

        await sleep(EMIT_WAIT_TIME);

        clientSocket2.emit("find_match", { userId: "2", difficulty: "medium" });

        await sleep(EMIT_WAIT_TIME);

        expect(data1).to.be.undefined;
        expect(data2).to.be.undefined;
    });

});

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
