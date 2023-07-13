const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const yup = require("yup");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet);
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.json({
    message: "URL Shortner for the laziest you",
  });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Listening at https://localhost:${port}`);
});
