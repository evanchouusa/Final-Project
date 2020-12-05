const assert = require("assert");
const { handleSession } = require("./sessionMiddleware");

const request = {
  session: {},
};
const response = {};
const now = () => {};

handleSession(request, response, now);
assert(request.session.id, "Has a session id");
assert(request.session.lastVisit, "Has a last visit");
assert(request.session.foo, "Doesnt have a foo");
