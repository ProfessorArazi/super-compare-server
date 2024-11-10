const express = require("express");
const {
    getProductsBySubject,
    getHomePageContent,
} = require("../controllers/products");

const router = express.Router();

router.get("/api/special/products", getHomePageContent);
router.get("/api/products/:subject", getProductsBySubject);

module.exports = router;
