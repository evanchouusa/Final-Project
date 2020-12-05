module.exports = (db) => (req, res) => {
  // I won't verify that we have req.body.cursor because
  // we don't need it to exist for this function to execute.
  // A cursor is a value to give back to the server to know
  // the item you want to start retrieval from.
  db.listQuestions(req.body.cursor)
    .then((data) => res.status(200).json(data))
    .catch(() => res.sendStatus(500));
};
