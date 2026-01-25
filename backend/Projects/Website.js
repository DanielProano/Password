const sqlite3 = require("sqlite3").verbose();
const { Router } = require("express");

module.exports = function (auth_limiter) {
  const router = Router();

  const db = new sqlite3.Database("./website.db", (err) => {
    if (err) return console.error("Problem with Web Database", err.message);
    else console.log("Connected to Database");
  });

  db.run(
    `
      CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         email TEXT UNIQUE NOT NULL,
         hash TEXT NOT NULL,
         salt TEXT NOT NULL
      )`,
    (err) => {
      if (err) console.error("Database error: ", err);
      else console.log("Database Running Successfully");
    },
  );

  router.post();
};
