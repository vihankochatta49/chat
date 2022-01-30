const mongoose = require("mongoose");

const schema = mongoose.Schema({
  name: String,
  msg: String,
});

module.exports = mongoose.model("chat", schema);
