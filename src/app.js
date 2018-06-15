const express = require("express");
const mongoose = require("mongoose");
const env = require("./environments");
const config = require("./config");

// Routes requirements
const usersRouter = require("./routes/users.route");
const postsRouter = require("./routes/posts.route");

const app = express();
// Connect to mongoose
mongoose.connect(
  env.db.url,
  function(err, db) {
    if (err) {
      console.log(
        "Unable to connect to the db-server. Please start the server. Error:",
        err
      );
      return;
    } else {
      console.log(`Connected to DB-Server successfully! @ ${env.db.url}`);
    }
  }
);
const db = mongoose.connection;

app.engine('html', require('ejs').renderFile);
app.use(express.json());
app.use(config.addHeaders);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);

app.get('/', function(req,res) {
    res.render("index.html", { pageCountMessage: null });
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port ${port}...`);
});
