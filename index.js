const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const port = 3000;
const app = express();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const connection = mysql.createConnection({
  host: "server2.bsthun.com",
  port: "6105",
  user: "lab_14smdo",
  password: "fGQknR3J6Mln2E1Y",
  database: "lab_todo02_145ghnp",
});

connection.connect();

console.log("Database is connected");

app.use(bodyParser.json({ type: "application/json" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post(
  "/register",
  check("password")
    .notEmpty()
    .withMessage("password cannot be empty")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
    .withMessage(
      "password must have at least 1 digit, uppercase, and lowercase"
    ),
  async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const hash = await bcrypt.hash(password, 10);
    connection.query(
      `INSERT INTO users (username, hashed_password) VALUES (?,?)`,
      [username, hash],
      (err, rows) => {
        if (err) {
          res.json({
            success: false,
            data: null,
            error: err.message,
          });
        } else {
          console.log(rows);
          if (rows) {
            res.json({
              success: true,
              data: {
                message: "create success",
              },
            });
          }
        }
      }
    );
  }
);
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  connection.query(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, rows) => {
      if (err) {
        res.json({
          success: false,
          data: null,
          error: err.message,
        });
      } else {
        numRows = rows.length;
        if (numRows == 0) {
          res.json({
            success: false,
            message: "this username does not exist",
          });
        }
        const isMatch = await bcrypt.compare(password, rows[0].hashed_password);
        if (!isMatch) {
          res.json({
            success: false,
            message: "the password is incorrect",
          });
        } else {
          res.json({
            success: true,
            message: "the password is correct",
            user: rows[0],
          });
        }
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
