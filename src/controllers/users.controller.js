const crypto = require("crypto");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const Users = require("../models/users.model");
const utils = require("../shared/utils");
const env = require("../environments");

// COMPLEX PASSWORD VALIDATION
// should contain at least one digit
// should contain at least one lower case
// should contain at least one upper case
// should contain at least 8 from the mentioned characters
// password: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/).required().error(new Error('my custom error message')),
const userValidationSchema = {
  email: Joi.string()
    .email()
    .required(),
  username: Joi.string()
    .min(6)
    .required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  salt: [Joi.string().required(), Joi.number().required()],
  create_date: Joi.date().default(Date.now, "time of creation"),
  update_date: Joi.date().default(Date.now, "time of update")
};

exports.index = function(req, res) {
  Users.find()
    .then(users => res.json(users))
    .catch(error => res.status(500).send(error));
};

exports.login = function(req, res) {
  Users.findOne({ username: req.body.username })
  .select('username password salt')
  .then(user => {
    if (!user) return res.status(401).send("Authentication is failed");

    const passwordToCompare = crypto
      .createHmac("sha256", user.salt)
      .update(req.body.password)
      .digest("hex");
    if (user.password === passwordToCompare) {
      console.log('user', user);
      createJWToken(user)
      .then(token => res.status(200).json(token))
      .catch(error => res.status(500).send(error));  
    } else {
      return res.status(401).send("Authentication is failed");
    }
  });
};

exports.signup = function(req, res) {
  validateAndCreateUser(req, function(error, newUser) {
    if (error) return res.status(error.code).send(error.message);

    createJWToken(newUser)
      .then(token => res.status(200).json(token))
      .catch(err => res.status(500).send(err));
  });
};

exports.create = function(req, res) {
  validateAndCreateUser(req, function(error, newUser) {
    if (error) return res.status(500).send(error);

    // @todo Need to send letter to users email (maybe for confirmation letter)
    return res.status(201).json(newUser);
  });
};

exports.read = function(req, res) {
  Users.findOne({ username: req.params.username })
    .then(user => {
      if (!user) return res.status(404).send("The user is not found!");

      return res.json(user);
    })
    .catch(error => res.status(500).send(error));
};

exports.update = function(req, res) {
  Users.findOneAndUpdate({ username: req.params.username }, req.body)
    .then(user => {
      if (!user) return res.status(404).send("The user is not found!");
      const updatedUser = Object.assign(user, req.body);

      return res.json(updatedUser);
    })
    .catch(error => res.status(500).send(error));
};

exports.delete = function(req, res) {
  Users.findOneAndRemove({ username: req.params.username })
    .then(user => {
      if (!user) return res.status(404).send("The user is not found!");

      return res.status(202).send(user);
    })
    .catch(error => res.status(500).send(error));
};

function validateAndCreateUser(req, callback) {
  const { error, value } = Joi.validate(req.body, userValidationSchema, {
    abortEarly: false
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return callback({
      code: 400,
      message: errorMessages
    });
  }

  const salt = utils.generateRandomHash();
  const saltedPassword = crypto
    .createHmac("sha256", salt)
    .update(req.body.password)
    .digest("hex");
  const newUser = new Users(value);
  newUser.password = saltedPassword;
  newUser.salt = salt;

  Users.create(newUser, err => {
    if (err) {
      err.code = 500;
    }
    return callback(err, newUser);
  });
}

function createJWToken(user) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        username: user.username,
        userId: user._id
      },
      env.jwtSecretKey,
      { expiresIn: "1w" },
      (err, token) => {
        if (err) {
          reject("Token creation is failed");
        }

        resolve({
          jwt: token
        });
      }
    );
  });
}
