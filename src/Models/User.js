const mongoose = require("mongoose");

const FavoriteProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});

const FavoriteSchema = new mongoose.Schema({
    cartName: {
        type: String,
        required: true,
    },
    products: [FavoriteProductSchema],
});

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    favorites: [FavoriteSchema],
    status: {
        type: String,
        enum: ["Pending", "Blocked", "Active"],
        default: "Pending",
    },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
