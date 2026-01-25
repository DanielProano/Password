const express = require("express");
const rate_limit = require("express-rate-limit");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: [
      "https://frontend-896359618082.europe-west1.run.app",
      "https://dannyproano.com",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const auth_limiter = rate_limit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

const db = new sqlite3.Database("./passwords.db", (err) => {
  if (err) {
    return console.error("Database connection error", err.message);
  }
  console.log("Connected to Database");
});

const passRoutes = require("./Projects/Password.js")(db, auth_limiter);
//const webRoutes = require("./Projects/Website.js")(db, auth_limiter);

app.use("/api", passRoutes);
//app.use("/api/website", webRoutes);

app.get("/api/wakeup", (req, res) => {
  console.log("Wakeup Backend Request");
});
