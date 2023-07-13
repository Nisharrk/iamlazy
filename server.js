const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const monk = require("monk");
const yup = require("yup");
const shortid = require("shortid");

require("dotenv").config();

const db = monk(process.env.MONGODB_URI);
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

const middlewares = require("./middlewares");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("common"));
app.use(express.static("./public"));

const notFoundPath = path.join(__dirname, "public/404.html");

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
});

app.get("/", (req, res) => {
  res.json({
    message: "URL Shortner for the laziest you",
  });
});

app.get("/:id", async (req, res, next) => {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug: slug.toLowerCase() });
    if (url) {
      return res.redirect(url.url);
    }
    return res.status(404).sendFile(notFoundPath);
  } catch (error) {
    return res.status(404).sendFile(notFoundPath);
  }
});

app.post("/url", async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });

    if (!slug) {
      slug = shortid.generate();
    } else {
      const existing = await urls.findOne({ slug });
      if (existing) {
        throw new Error("Slug in use. 🍔");
      }
    }
    slug = slug.toLowerCase();
    const newUrl = {
      url,
      slug,
    };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    next(error);
  }
});

// Error Handlers, see middlewares.js
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
