require("dotenv").config();
const express = require("express");
const app = express();
const path = require("node:path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("editor", { title: "ImageKit" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on PORT:${PORT}`);
});
