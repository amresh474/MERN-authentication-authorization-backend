const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const auth_routes = require("./routes/auth.route");
const user_routes = require("./routes/user.route");
const barcode_routes = require("./routes/barCode.route");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());

// routes

app.use("/v1/auth", auth_routes);
app.use("/api/v1", user_routes);
app.use("/api/v1", barcode_routes);

console.log("process.env.MONGODB_URL",process.env.DB_CONN_STRING)
mongoose
  .connect(`${process.env.DB_CONN_STRING}`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(5000);
    console.log("Database is connected! Listening to localhost 5000");
  })
  .catch((err) => console.log(err));
