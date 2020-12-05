/**
 * Because module.exports is just any sort of object,
 * we can even just export a function!
 *
 */
module.exports = (db) => (req, res) => {
  const questionID = req.params.id;

  // remember to ALWAYS verify that your clients give you the data
  // that you need. You can't trust them.
  if (!questionID) {
    return res.sendStatus(404);
  }

  // readQuestion is just some function that takes in a questionID (string)
  // and returns a promise. When the promise resolves, it sends back some
  // JSON object (array or object) from the database
  db.readQuestion(questionID)
    .then((data) => {
      if (!data) {
        return res.sendStatus(404);
      }

      // pass through the data that we have
      return res.status(200).json(data);
    })
    .catch(() => {
      // if there was some sort of error talking with the DB
      // then it's a server side problem so we use a 500
      return res.sendStatus(500);
    });
};
