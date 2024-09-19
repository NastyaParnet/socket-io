const Client = require("socket.io-client");
require("dotenv").config({ path: './config.env' });

jest.useRealTimers();

describe("messages", () => {
  let io, clientSocket1, clientSocket2, clientSocket3, connectionUrl;

  beforeAll(() => {
    io = require("../index");
    connectionUrl = `http://localhost:${process.env.PORT}`;
    clientSocket1 = new Client(connectionUrl);
    clientSocket2 = new Client(connectionUrl);
    clientSocket3 = new Client(connectionUrl);

    clientSocket1.emit("join", "1");
    clientSocket2.emit("join", "2");
    clientSocket3.emit("join", "3");
  });
  afterEach(() => {});

  afterAll(() => {
    clientSocket1.close();
    clientSocket2.close();
    clientSocket3.close();
    io.close();
  });

  test("sent to all, received by '2'", (done) => {
    clientSocket2.on("chat message", (arg) => {
      expect(arg).toEqual({ message: "Hello all", name: "3" });
      done();
    });
    clientSocket3.emit("chat message", "Hello all");
  });

  test("sent to all, received by '1'", (done) => {
    clientSocket1.on("chat message", (arg) => {
      expect(arg).toEqual({ message: "Hello all", name: "3" });
      done();
    });
    clientSocket3.emit("chat message", "Hello all");
  });

  test("sent to all, received by '1' and '2'", (done) => {
    let socket1Received = false;
    let socket2Received = false;
    clientSocket1.on("chat message", (arg) => {
      expect(arg).toEqual({ message: "Hello all", name: "3" });
      socket1Received = true;
    });

    clientSocket2.on("chat message", (arg) => {
      expect(arg).toEqual({ message: "Hello all", name: "3" });
      socket2Received = true;
    });

    clientSocket3.emit("chat message", "Hello all");
    setTimeout(() => {
      if (!socket1Received) done("'1' didn't receive a message");
      if (!socket2Received) done("'2' didn't receive a message");
      done();
    }, 3000);
  });

  test("sent to all, didn't receive its own message", (done) => {
    clientSocket3.on("chat message", () => {
      done("Shouldn't have received my own message");
    });

    clientSocket3.emit("chat message", "Hello all");
    setTimeout(() => {
      done();
    }, 3000);
  });

  test("sent to 1, received by '1'", (done) => {
    clientSocket1.on("personal message", (arg) => {
      expect(arg).toEqual({ message: "Hello 1", name: "3" });
      done();
    });
    clientSocket3.emit("personal message", {
      to: "1",
      message: "Hello 1",
    });
  });

  test("sent to 1, not received by '2'", (done) => {
    clientSocket2.on("personal message", () => {
      done("'2' shouldn't have received personal message sent to '2'");
    });
    clientSocket3.emit("personal message", {
      to: "1",
      message: "Hello 1",
    });
    setTimeout(() => {
      done();
    }, 3000);
  });
});
