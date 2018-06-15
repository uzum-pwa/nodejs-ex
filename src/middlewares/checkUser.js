const jwt = require("jsonwebtoken");
const env = require("../environments");

module.exports = function checkUser(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, env.jwtSecretKey, null, (err, decoded) => {
      if (err) return res.status(401).send("Action is forbiden!");

      req.jwtDecoded = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).send(error);
  }
};
