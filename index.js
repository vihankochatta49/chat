const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http").createServer(app);
const cd = require("./models.js");
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chat")
  .then(() => console.log("Connection successful..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const io = require("socket.io")(http);
const users = {};

io.on("connection", (socket) => {
  cd.find().then((result) => {
    socket.emit("output-messages", result);
  });
  socket.on("new-user-joined", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", (message) => {
    const userMsg = new cd({ name: users[socket.id], msg: message });
    userMsg.save().then(() => {
      socket.broadcast.emit("recieve", {
        message: message,
        name: users[socket.id],
      });
    });
  });

  socket.on("disconnect", (message) => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id];
  });
});

http.listen(port);
