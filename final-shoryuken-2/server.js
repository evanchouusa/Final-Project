// Requiring express + express middleware
const express = require("express");
const compression = require("compression");
const cookieSession = require("cookie-session");

// Custom middleware that we've written
const { sessionMiddleware, logMiddleware } = require("./middleware");

// Database handler (for us, it's firebase)
const db = require("./databases/firebase");

// When you require a directory in node, it looks for an index.js file
// and automatically runs it. So this loooks for the ./routes/index.js file.
// If you specify a file, it'll require the file.
const {
  getQuestion,
  createQuestion,
  getAllQuestions,
  deleteQuestion,
  voteQuestion,
} = require("./routes");

const { PORT, TWENTY_FOUR_HOURS_MS } = require("./utils/constants");

const main = () => {
  const app = express();

  // express.json() parses responses that have a content-type: application/json
  // header by using JSON.parse() on req.body
  app.use(express.json());

  // express.static lets you serve static files back to people/users
  // we're serving files from the "static" directory on our file system
  // to be a little bit more clear, this is actually apath
  app.use(express.static("./static"));

  // parses a cookie named "session" to correlate user requests
  app.use(
    cookieSession({
      name: "session",
      secret: "my-secret-key-pls-dont-leak-me",

      // Cookie Options - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
      maxAge: TWENTY_FOUR_HOURS_MS,
    })
  );

  app.use(sessionMiddleware);
  // use logMiddleware after static so that none of the static requests
  // log to our server (else there'll be too much noise)
  app.use(logMiddleware);

  // http://expressjs.com/en/resources/middleware/compression.html
  // compresses responses before sending
  app.use(compression());

  /**
   * This is the power of higher order functions. Db can be anything
   * that has a readQuestion. It doesn't have to be the same db that
   * we use in server.js.
   *
   * I recommend actually going through these files in order and actually
   * reading through them. I've commented the differences between them.
   */
  app.get("/api/question/:id", getQuestion(db));
  app.get("/api/questions", getAllQuestions(db));

  app.post("/api/question", createQuestion(db));

  app.put("/api/:id/upvote", voteQuestion(db)("upvotes", 1));
  app.put("/api/:id/downvote", voteQuestion(db)("downvotes", 1));

  app.delete("/api/:id", deleteQuestion);

  app.listen(PORT, (err) => {
    if (err) {
      console.log(err);
    }

    console.log("Server listening on PORT", PORT);
  });
};

main();
