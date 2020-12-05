const firebase = require("firebase");
require("firebase/database");

// you can grab your config from the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyDQxuUjCOzPCQaP-cOyj3ZwHeA_9_YR2Nc",
  authDomain: "shoryuken-96281.firebaseapp.com",
  databaseURL: "https://shoryuken-96281.firebaseio.com",
  projectId: "shoryuken-96281",
  storageBucket: "shoryuken-96281.appspot.com",
  messagingSenderId: "1090413652700",
  appId: "1:1090413652700:web:b42948cc71a3664ccea219",
};

// initialize firebase
firebase.initializeApp(firebaseConfig);

// get a reference to interact with database
const database = firebase.database();

// write a question to the database using the set method
// https://firebase.google.com/docs/database/web/read-and-write#basic_write
const writeQuestion = (question) => {
  return database.ref(`questions/${question.id}`).set(question);
};

// read a question with a given id from the database using the then method
// firebase is a realtime database that notifies clients (in this case, the client
// is actually our server) of any changes so that it can stay in sync. That's what
// makes it a "realtime" database
// https://firebase.google.com/docs/database/web/read-and-write#listen_for_value_events
const readQuestion = (id) => {
  return database
    .ref(`questions/${id}`)
    .once("value")
    .then((snapshot) => {
      return snapshot.val();
    });
};

// https://firebase.google.com/docs/database/web/lists-of-data#sort_data
const listQuestions = (startAt) => {
  let query = database
    .ref("questions")
    // order children by the date modified, you can change this based on some
    // criteria (like popularity [upvotes], or creation time [created])
    .orderByChild("dateModified")
    // limit to only 20 entries so clients aren't waiting for the contents of
    // the entire database.
    .limitToLast(20);

  if (startAt) {
    query = query.startAt(startAt);
  }

  // not every function returns a Promise, so here's one way to keep our API
  // promise based. We have the callback return or resolve a promise
  return new Promise((resolve) => {
    query.on("value", (snapshot) => {
      const data = [];
      // this isn't an array forEach, it's from the firebase documentation.
      // a snapshot has a forEach method
      // https://firebase.google.com/docs/database/web/lists-of-data#listen_for_value_events
      snapshot.forEach((child) => {
        data.push(child.val());
      });
      resolve(data);
    });
  });
};

const deleteQuestion = (id) => {
  // we use set instead of delete because set can return us a promise
  // https://firebase.google.com/docs/database/web/read-and-write#receive_a_promise
  return database.ref(`questions/${id}`).set(null);
};

const updateQuestion = (id, newValue) => {
  return database.ref(`questions/${id}`).update(newValue);
};

module.exports = {
  writeQuestion,
  readQuestion,
  listQuestions,
  deleteQuestion,
  updateQuestion,
};
