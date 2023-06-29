const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Controllers
const downloadRouter = require("./controllers/download");
const informationRouter = require("./controllers/information");

app.get("/", (req, res) => {
  res.send("Hello World! :)");
});

app.use("/", downloadRouter);
app.use("/info", informationRouter);

app.listen(3000, () => {
  console.log("Server on port 3000");
});
