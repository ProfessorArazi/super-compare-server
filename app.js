const express = require("express");
require("dotenv").config({ path: __dirname + "/.env" });
require("./src/db/mongoose");
const cors = require("cors");

const cartRouter = require("./src/routers/cart");
const productsRouter = require("./src/routers/products");
const authRouter = require("./src/routers/auth");
const favoritesRouter = require("./src/routers/favorites");

const { verifyToken } = require("./src/middlewares/authenticate");
const { connectRedis } = require("./src/cache/redisClient");

const app = express();
app.use(express.json({ limit: "50mb" }));

const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(productsRouter);
app.use(cartRouter);
app.use(authRouter);
app.use(verifyToken);
app.use(favoritesRouter);

(async () => {
    await connectRedis();
})();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
