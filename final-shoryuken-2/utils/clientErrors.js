/**
 * This file will export all the errors the application can throw back to
 * the user.
 */
module.exports = {
  // I'm using a type field here so that clients can programatically
  // distinguish the sorts of errors they might receive. Instead of
  // parsing the message they receive.
  missingFieldError: (field) => ({
    field,
    type: "MISSING_REQUIRED_FIELD",
    message: `No ${field} field included in JSON body`,
  }),
};
