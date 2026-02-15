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
  res.render("editor", { title: "Image Editor" });
});

app.get("/compress", (req, res) => {
  res.render("compress", { title: "Compress Images" });
});

app.get("/metadata", (req, res) => {
  res.render("metadata", { title: "Metadata Editor" });
});

app.get("/remove-bg", (req, res) => {
  res.render("remove", { title: "Remove Background" });
});

app.get("/img-to-pdf", (req, res) => {
  res.render("imgtopdf", { title: "Image to PDF" });
});

app.get("/filters", (req, res) => {
  res.render("filters", { title: "Apply Filters" });
});

app.get("/convert", (req, res) => {
  res.render("convert", { title: "convert" });
});

app.get("/extract-text", (req, res) => {
  res.render("extract", { title: "Extract Texts from your image" });
});

app.get("/upscale", (req, res) => {
  res.render("upscale", { title: "Upscale Image" });
});

app.get("/pdf-to-jpg", (req, res) => {
  res.render("pdftojpg", { title: "Upscale Image" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
