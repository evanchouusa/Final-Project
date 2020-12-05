module.exports = (req, res, next) => {
  // attach any piece of information you want to track a request
  res.locals.log = {};
  next();
  console.log(res.locals.log);
};
