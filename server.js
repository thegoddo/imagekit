require("dotenv").config();
const express = require("express");
const app = express();
const path = require("node:path");
const { title } = require("node:process");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// HOMEPAGE
app.get("/", (req, res) => {
  res.render("index");
});

// EDITOR
app.get("/editor", (req, res) => {
    res.render('editor', {title: "Image Editor"})
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
