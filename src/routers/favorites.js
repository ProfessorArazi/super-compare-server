const express = require("express");
const {
    getFavorites,
    addFavorite,
    editFavorite,
} = require("../controllers/favorites");
const favoritesRouter = express.Router();

favoritesRouter.get("/api/favorites", getFavorites);
favoritesRouter.post("/api/favorites/save", addFavorite);
favoritesRouter.post("/api/favorites/edit", editFavorite);

module.exports = favoritesRouter;
