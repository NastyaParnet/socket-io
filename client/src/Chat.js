import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import io from "socket.io-client";

const Chat = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_SERVER);
    socketRef.current = socket;

    const name = prompt("Please enter your name:");
    setName(name);

    socket.emit("join", name);

    socket.on("name taken", () => {
      const name = prompt("The name is taken. Please enter another name:");
      setName(name);
      socket.emit("join", name);
    });

    socket.on("chat message", (data) => {
      setMessages((messages) => [...messages, data]);
    });

    socket.on("personal message", (data) => {
      setMessages((messages) => [
        ...messages,
        { name: `Personal from ${data.name}`, message: data.message },
      ]);
    });

    socket.on("user list", (users) => {
      setUsers(users);
    });

    socket.on("user joined", (name) => {
      setMessages((messages) => [
        ...messages,
        { name: "System", message: `${name} has joined the chat.` },
      ]);
    });

    socket.on("user left", (name) => {
      setMessages((messages) => [
        ...messages,
        { name: "System", message: `${name} has left the chat.` },
      ]);
    });

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, []);

  const handleSubmit = (event) => {
    if (!message) return;
    event.preventDefault();
    selectedUser ? handlePersonalMessageSubmit() : handleToAllMessageSubmit();
    setMessage("");
  };

  const handleToAllMessageSubmit = () => {
    socketRef.current.emit("chat message", message);
    setMessages((messages) => [...messages, { name, message }]);
  };

  const handlePersonalMessageSubmit = () => {
    socketRef.current.emit("personal message", { message, to: selectedUser });
    setMessages((messages) => [
      ...messages,
      { name: `personal to ${selectedUser}`, message },
    ]);
  };
  return (
    <div className="container">
      <h1>Chat Application</h1>
      <div className="container-inner">
        <div className="user-list">
          <h3>Message To:</h3>
          <h2 onClick={() => setSelectedUser("")}>all users</h2>
          <ul>
            {users.map((user) => (
              <li
                className={selectedUser === user ? "selected" : undefined}
                key={user}
                onClick={() => setSelectedUser(user)}
              >
                {user}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-room">
          <div className="chat-messages custom-scrollbar">
            {messages.map((data, index) => (
              <div key={index}>
                <strong>{data.name}: </strong>
                {data.message}
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
