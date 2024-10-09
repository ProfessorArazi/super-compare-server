const express = require("express");
const {
    getProductsBySubject,
    compareProducts,
} = require("../controllers/products");

const router = express.Router();

router.get("/api/products/:subject", getProductsBySubject);
router.post("/api/products/compare", compareProducts);

module.exports = router;
