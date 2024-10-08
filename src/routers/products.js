const express = require("express");
const {
    getProductsBySubject,
    compareProducts,
} = require("../controllers/products");

const router = express.Router();

router.get("/products/:subject", getProductsBySubject);
router.post("/compare", compareProducts);

module.exports = router;
