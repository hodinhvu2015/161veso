const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Trang chu hoat dong!");
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.listen(3000, () => {
    console.log("Server chay o http://localhost:3000");
});