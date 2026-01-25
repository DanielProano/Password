const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Router } = require("express");

module.exports = function (db, auth_limiter) {
  const router = Router();
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         username TEXT UNIQUE NOT NULL,
         hash TEXT NOT NULL,
         master_salt TEXT NOT NULL,
         enc_salt TEXT NOT NULL
      )`,
    (err) => {
      if (err) console.error("Users table access failure:", err);
      else console.log("Users table access successful");
    },
  );

  router.get("/salt", auth_limiter, async (req, res) => {
    const user = req.query.user;

    if (!user) {
      return res.status(400).json({ message: "Username required" });
    }

    db.get(
      "SELECT master_salt FROM users WHERE username =?",
      [user],
      (err, row) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        if (!row) return res.status(404).json({ error: "User does not exist" });

        res.status(200).json({ master_salt: row.master_salt });
      },
    );
  });

  // Function for user login

  router.post("/register", auth_limiter, async (req, res) => {
    const { user, hash, master_salt } = req.body;

    if (!user || !hash || !master_salt) {
      return res.status(400).json({ error: "Need a user, pass, or salt" });
    }

    try {
      const vault_salt = crypto.randomBytes(16).toString("base64");

      db.run(
        `INSERT INTO users(username, hash, master_salt, enc_salt) VALUES(?, ?, ?, ?)`,
        [user, hash, master_salt, vault_salt],
        (err) => {
          if (err) {
            console.log("DB Insert Error", err.message);
            return res.status(500).json({ error: "DB Error" });
          }
          console.log("Was a success");
          res.status(201).json({ message: "User registered successfully" });
        },
      );
    } catch (err) {
      console.log("General problem with /api/register", err);
      res.status(500).json({ error: "Internal server error0" });
    }
  });

  // Function for verifying login

  router.post("/verify", auth_limiter, async (req, res) => {
    const { user, hash } = req.body;

    try {
      const row = await new Promise((resolve, reject) => {
        db.get(
          "SELECT id, hash, enc_salt FROM users WHERE username = ?",
          [user],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          },
        );
      });

      if (!row) {
        return res.status(401).json({ error: "User not found" });
      }

      const isValid = hash === row.hash;

      if (isValid) {
        console.log("Correct Password, user authenticated.");

        const token = jwt.sign({ user_id: row.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res.status(200).json({
          message: "Authentication successful",
          token: token,
          salt: row.enc_salt,
        });
      } else {
        console.log("Wrong Password, authentication failed.");
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (err) {
      console.error("Error occured:", err);
      res.status(500).json({ error: err });
    }
  });

  // Database that stores a user's passwords

  db.run(
    `CREATE TABLE IF NOT EXISTS vault (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         service TEXT NOT NULL,
         login TEXT NOT NULL,
         password TEXT NOT NULL,
         notes TEXT DEFAULT '',
         FOREIGN KEY(user_id) REFERENCES users(id)
      )`,
    (err) => {
      if (err) console.log("Vault table access failure:", err);
      else console.log("Vault table access Success");
    },
  );

  // Validate the JWT token from the user

  function validateToken(req, res, next) {
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];
    const key = process.env.JWT_SECRET;

    try {
      const verified = jwt.verify(token, key);
      req.user = verified;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Expired Token" });
      }
      return res.status(403).json({ error: "Invalid token" });
    }
  }

  // Stores password info

  router.post("/vault/store", validateToken, async (req, res) => {
    const { service, login, password, notes } = req.body;
    const userID = req.user.user_id;

    if (!service || !login || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    db.run(
      `INSERT INTO vault (user_id, service, login, password, notes) VALUES (?, ?, ?, ?, ?)`,
      [
        userID,
        JSON.stringify(service),
        JSON.stringify(login),
        JSON.stringify(password),
        JSON.stringify(notes || {}),
      ],
      function (err) {
        if (err) {
          console.error("Vault insert error:", err.message);
          return res.status(500).json({ error: "Problem saving password" });
        }

        res.status(201).json({ message: "Inserted Password successfully" });
      },
    );
  });

  // Updates password info

  router.patch("/vault/update/:id", validateToken, async (req, res) => {
    const fields = ["service", "login", "password", "notes"];

    let updates = [];
    let values = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    values.push(req.user.user_id, req.params.id);

    const sql = `UPDATE vault SET ${updates.join(",")} WHERE user_id = ? AND id = ?`;

    db.run(sql, values, function (err) {
      if (err) {
        console.error("Vault error:", err.message);
        return res.status(500).json({ error: "Database internal error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Vault error" });
      }

      return res.status(200).json({ message: "Update Successful" });
    });
  });

  router.get("/vault/get", validateToken, async (req, res) => {
    const user_id = req.user.user_id;

    db.all("SELECT * FROM vault WHERE user_id = ?", [user_id], (err, rows) => {
      if (err) {
        console.error("Error while retrieving vault", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.status(200).json({ vault: rows });
    });
  });

  router.get("/me", validateToken, (req, res) => {
    res.status(200).json({ user_id: req.user.user_id });
  });

  router.delete("/vault/delete/:id", validateToken, (req, res) => {
    const userID = req.user.user_id;
    const vaultID = req.params.id;

    const sql = `DELETE FROM vault WHERE user_id = ? AND id = ?`;

    db.run(sql, [userID, vaultID], function (err) {
      if (err) {
        console.error("Error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Entry not found" });
      }

      return res.status(200).json({ message: "Deleted Successfully" });
    });
  });

  return router;
};
