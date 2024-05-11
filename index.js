const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173/"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("job nebula is looking for a job");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
