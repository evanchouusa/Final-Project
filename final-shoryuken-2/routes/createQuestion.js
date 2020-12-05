const uuid = require("uuid");

// notice that I'm using a relative path. This says to go up one
// directory, then go into the utils directory. Lastly, look for the
// clientErrors file
const { missingFieldError } = require("../utils/clientErrors");

module.exports = (db) => (req, res) => {
  const questionText = req.body.question;

  if (!questionText) {
    res.status(400).json({
      error: missingFieldError("question"),
    });
    return;
  }

  // create a new unique id for this question
  const id = uuid.v4();
  const now = Math.floor(new Date().getTime() / 1000);

  // because we're just storing JSON data, this'll nbe the data model that we use
  const question = {
    id,
    text: questionText,
    upvotes: 0,
    downvotes: 0,
    // because req.session is changeable, this is actually a point
    // of attack. People can change (or delete) their session cookie
    // and re-upvote.
    creator: req.session.id,

    // we'll often have metadata like dateCreated and dateModified so that
    // we can order entries when retrieving them. It's also great to keep
    // as an audit log
    dateCreated: now,
    dateModified: now,
  };

  // if there was some error trying to write the question,
  // send back a 500 response
  db.writeQuestion(question)
    .then(() => res.status(201).json(question))
    .catch(() => res.sendStatus(500));
};
