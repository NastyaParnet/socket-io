const Client = require("socket.io-client");
require("dotenv").config({ path: './config.env' });

jest.useRealTimers();

describe("my awesome project", () => {
  let io, clientSocket1, clientSocket2, clientSocket3, connectionUrl;

  beforeAll((done) => {
    io = require("../index");
    connectionUrl = `http://localhost:${process.env.PORT}`;
    clientSocket1 = new Client(connectionUrl);
    clientSocket1.on("user list", () => {
      clientSocket1.off("user list");
      done();
    });
    clientSocket1.emit("join", "1");
  });

  beforeEach(() => {
    clientSocket2 = new Client(connectionUrl);
  });

  afterEach(() => {
    clientSocket2.close();
    if (clientSocket3) {
      clientSocket3.close();
      clientSocket3 = undefined;
    }
  });

  afterAll(() => {
    io.close();
    clientSocket1.close();
  });

  test("should emit 'name taken' event on 'join' with existing name", (done) => {
    clientSocket2.on("name taken", () => {
      done();
    });
    clientSocket2.emit("join", "1");
  });

  test("should emit 'user list' event to the sender on 'join'", (done) => {
    clientSocket2.on("user list", (arg) => {
      expect(arg).toEqual(["1", "2"]);
      done();
    });
    clientSocket2.emit("join", "2");
  });

  test("should emit 'user list' event to others on 'join'", (done) => {
    clientSocket1.on("user list", (arg) => {
      if (arg.length !== 2) return;
      expect(new Set(arg)).toEqual(new Set(["1", "2"]));
      clientSocket1.off("user list");
      done();
    });
    clientSocket2.emit("join", "2");
  });

  test("should emit 'user joined' event on 'join' with unique name", (done) => {
    clientSocket1.once("user joined", (arg) => {
      expect(arg).toEqual("2");
      done();
    });
    clientSocket2.emit("join", "2");
  });

  test("should2 emit 'user left' event to others on disconnect", (done) => {
    clientSocket2.emit("join", "2");
    clientSocket1.once("user left", (arg) => {
      expect(arg).toEqual("2");
      done();
    });
    clientSocket2.close();
  });

  test("should emit 'user list' event to others on disconnect", (done) => {
    clientSocket3 = new Client(connectionUrl);
    clientSocket2.emit("join", "2");
    clientSocket3.emit("join", "3");
    clientSocket2.on("user list", (arg) => {
      expect(new Set(arg)).toEqual(new Set(["1", "2"]));
      done();
    });
    clientSocket3.close();
  });
});
