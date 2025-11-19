import express from "express";
import path from "path";

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});