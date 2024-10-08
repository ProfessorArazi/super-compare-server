const express = require("express");
require("dotenv").config({ path: __dirname + "/.env" });
require("./src/db/mongoose");
const cors = require("cors");

const productsRouter = require("./src/routers/products");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(productsRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));

module.exports = app;
