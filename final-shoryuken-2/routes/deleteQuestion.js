module.exports = (db) => (req, res) => {
  db.deleteQuestion(req.params.id)
    .then(() => {
      // if we've deleted, we'll have no content, so we send back
      // a 204
      res.sendStatus(204);
    })
    .catch(() => {
      // this is an assumption that once we've connected to the db
      // we can't delete something that doesn't exist
      res.sendStatus(404);
    });
};
