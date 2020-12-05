module.exports = (db) => (column, step) => (req, res) => {
  const id = req.params.id;
  console.log(id);

  // updates require us to first do a get, then an update.
  // we need to get first in order to verify our application logic:
  // (1) a creator cannot upvote or downvote their own questions
  // (2) people can only vote once for a given question
  db.readQuestion(id)
    .then((question) => {
      if (!question) {
        return res.sendStatus(404);
      }

      if (question.creator === req.session.id) {
        return res.sendStatus(400);
      }

      const updatedQuestion = {
        // use the spread operator here to spread each property
        // of our previousQuestion
        ...question,
        // then overwrite the new fields in the lines after
        dateModified: Math.floor(new Date().getTime() / 1000),
        // this line, we use the value stored in the column parameter
        // as our key and then add step to it
        [column]: parseInt(question[column], 10) + step,
      };

      db.updateQuestion(id, updatedQuestion);
      return updatedQuestion;
    })
    .then((update) => {
      if (!res.headersSent) {
        return res.status(200).json(update);
      }
    })
    .catch((err) => {
      console.error(err);
      if (!res.headersSent) {
        return res.sendStatus(500);
      }
    });
};
