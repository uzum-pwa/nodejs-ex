const jwt = require("jsonwebtoken");
const Users = require("../models/users.model");
const env = require("../environments");

const adminUsernames = ["somecooladmin"];

module.exports = function(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, env.jwtSecretKey, null, (err, decoded) => {
    if (err) return res.status(401).send("Action is forbiden!");

    Users.findOne({ username: decoded.username })
      .then(user => {
        if (!user) return res.status(401).send("Authentication is failed");

        const index = adminUsernames.findIndex(u => user.username === u);
        if (!~index) {
          return res.status(401).send("Authentication is failed");
        }

        next();
      })
      .catch(err => res.status(500).send(err));
  });
};
