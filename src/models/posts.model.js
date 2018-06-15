const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  id: mongoose.Schema.ObjectId,
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ["ru-RU", "tk-TM"]
  },
  comments: [{
    type: mongoose.Schema.ObjectId,
    require: true,
    ref: "Comments"
  }],
  votes: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        require: true,
        ref: "Users"
      },
      thumb: String
    }
  ],
  attachments: {
    pictures: [String]
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

const Posts = mongoose.model("Posts", PostSchema);

module.exports = Posts;
