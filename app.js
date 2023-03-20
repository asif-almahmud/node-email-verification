const express = require("express");
require("dotenv").config();
// ~ connect to db
require("./db");
// ~ routes
const userRouter = require("./routes/user");

const app = express();

const PORT = process.env.PORT || 5000;

//-> Our custom parser for converting the buffer data to json data
//-> And add data to body property for later user
// const JSONPARSER = (req, res, next) => {
//   req.on("data", (chunk) => { // chunk is a bufffer data
//     req.body = JSON.parse(chunk);
//     next();
//   });
// };
//
// app.use(JSONPARSER);

//-> But express has a built-in method to do the same job
app.use(express.json());

app.use("/api/user", userRouter);

//~ start the app and listen for requests on the defined PORT
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
