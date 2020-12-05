const { performance } = require("perf_hooks");
const uuid = require("uuid");

module.exports = (req, res, next) => {
  if (!req.session.id) {
    req.session.id = uuid.v4();
  }

  req.session.lastVisit = performance.now();

  next();
};
