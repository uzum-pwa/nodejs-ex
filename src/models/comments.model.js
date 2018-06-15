const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
  id: mongoose.Schema.ObjectId,
  text: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    require: true,
    ref: "Users"
  },
  create_date: {
    type: Date,
    default: Date.now
  },
  update_date: {
    type: Date,
    default: Date.now
  }
});

const Comments = mongoose.model("Comments", CommentSchema);

module.exports = Comments;
