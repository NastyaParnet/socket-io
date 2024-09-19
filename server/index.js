const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

let connectIdWithName = {}

io.on("connection", (socket) => {
  let name = '';

  socket.on("join", (data) => {
    if(!data || Object.keys(connectIdWithName).includes(data)) {
      socket.emit("name taken");
    } else {
      name = data;
      connectIdWithName = {...connectIdWithName, [data]: socket.id};
      socket.join('chat');
      io.in('chat').emit("user joined", data);
      io.in('chat').emit("user list", Object.keys(connectIdWithName));
    }
  });

  socket.on("chat message", (data) => {
    socket.to("chat").emit("chat message", {name, message: data});
  });

  socket.on("personal message", ({to: recipientName, message}) => {
    const socketId = connectIdWithName[recipientName];
    socket.to(socketId).emit("personal message", {name, message});
  });

  socket.on("disconnect", () => {
    delete connectIdWithName[name];
    socket.broadcast.emit("user left", name);
  });
});

module.exports = io;
