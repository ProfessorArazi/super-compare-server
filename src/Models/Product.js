const mongoose = require("mongoose");
const PriceSchema = require("./Price");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    categories: [
        {
            type: String,
            required: true,
        },
    ],
    isOutOfStock: {
        type: Boolean,
        required: true,
    },
    minPrice: {
        type: Number,
        required: true,
    },
    maxPrice: {
        type: Number,
        required: true,
    },
    prices: [PriceSchema],
    brand: {
        type: String,
    },
    weight: {
        type: Number,
    },
    images: [String],
    last_updated: {
        type: Date,
        default: Date.now,
    },
});

ProductSchema.virtual("id").get(function () {
    return this._id?.toHexString();
});

ProductSchema.set("toJSON", {
    virtuals: true,
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
