const Joi = require("joi");
const Posts = require("../models/posts.model");
const Comments = require("../models/comments.model");
const utils = require("../shared/utils");

const postValidationSchema = {
  title: Joi.string()
    .required()
    .min(5),
  description: Joi.string()
    .required()
    .min(20),
  language: Joi.string()
    .max(5)
    .default("tk-TM"),
  attachments: Joi.object({
    pictures: Joi.array().items(Joi.string())
  }),
  create_date: Joi.date().default(Date.now, "time of creation"),
  update_date: Joi.date().default(Date.now, "time of update")
};

const commentValidationSchema = {
  text: Joi.string()
    .required()
    .min(1),
  create_date: Joi.date().default(Date.now, "time of creation"),
  update_date: Joi.date().default(Date.now, "time of update")
};

// @todo populating posts with os.user and comments is performance decresing
exports.index = function(req, res) {
  Posts.find()
    .sort({ create_date: -1 })
    .populate("votes.user")
    .populate({
      path: "comments",
      populate: {
        path: "user"
      }
    })
    .exec()
    .then(posts => res.json(posts))
    .catch(error => res.status(500).send(error));
};

exports.create = function(req, res) {
  const { error, value } = Joi.validate(req.body, postValidationSchema, {
    abortEarly: false
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).send(errorMessages);
  }

  const newPost = new Posts(value);
  Posts.create(newPost, function(error) {
    if (error) return res.status(500).send(error);

    return res.status(201).json(newPost);
  });
};

exports.read = function(req, res) {
  Posts.findById(req.params.id)
    .populate("votes.user")
    .populate({
      path: "comments",
      populate: {
        path: "user"
      }
    })
    .exec()
    .then(post => {
      if (!post) return res.status(404).send("The post is not found!");

      return res.json(post);
    })
    .catch(error => res.status(500).send(error));
};

exports.update = function(req, res) {
  res.send("post update");
};

exports.delete = function(req, res) {
  Posts.findByIdAndRemove(req.params.id, function(error, post) {
    if (error) return res.status(500).send(error);
    if (!post) return res.status(404).send("The post is not found!");

    return res.json(post);
  });
};

exports.vote = function(req, res) {
  Posts.findById(req.params.id)
    .then(post => {
      const thumbParam = req.query.thumb;
      const index = post.votes.findIndex(v => v.user == req.jwtDecoded.userId);

      if (~index) {
        if (post.votes[index].thumb === thumbParam) {
          post.votes.splice(index, 1);
        } else {
          post.votes[index] = {
            user: req.jwtDecoded.userId,
            thumb: thumbParam
          };
        }
      } else {
        post.votes.push({
          user: req.jwtDecoded.userId,
          thumb: thumbParam
        });
      }

      return post.save();
    })
    .then(result => res.send(result))
    .catch(error => {
      return res.send(error);
    });
};

exports.addComment = function(req, res) {
  let newComment;

  Posts.findById(req.params.id)
    .then(p => {
      if (!p) return res.status(404).send("The post is not found!");
      post = p;

      const { error, value } = Joi.validate(req.body, commentValidationSchema, {
        abortEarly: false
      });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).send(errorMessages);
      }

      value.user = req.jwtDecoded.userId;
      newComment = new Comments(value);
      return Comments.create(newComment);
    })
    .then(comment => {
      post.comments.push(comment._id);
      return post.save();
    })
    .then(post => res.status(201).send(newComment))
    .catch(error => {
      return res.status(500).send(error);
    });
};
