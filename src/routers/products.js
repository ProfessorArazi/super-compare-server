const express = require("express");
const {
    getProductsBySubject,
    compareProducts,
    getHomePageContent,
} = require("../controllers/products");

const router = express.Router();

router.get("/api/special/products", getHomePageContent);
router.get("/api/products/:subject", getProductsBySubject);
router.post("/api/products/compare", compareProducts);

module.exports = router;
