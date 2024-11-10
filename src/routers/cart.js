const express = require("express");
const { getCart, compare, manageCart } = require("../controllers/cart");

const router = express.Router();

router.get("/api/cart/:cartId/compare", compare);
router.get("/api/cart/:cartId", getCart);
router.post("/api/cart/:cartId?", manageCart);

module.exports = router;
