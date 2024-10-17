const express = require("express");
const { register, login, verify } = require("../controllers/auth");
const authRouter = express.Router();

authRouter.post("/api/auth/signup", register);
authRouter.post("/api/auth/signin", login);
authRouter.get("/api/auth/verify", verify);

module.exports = authRouter;
