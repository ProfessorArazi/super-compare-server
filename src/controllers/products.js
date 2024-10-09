const Product = require("../Models/Product");
const axios = require("axios");

const hebrewToEnglish = {
    "יינות ביתן": "ybitan",
    מגה: "carrefour",
    קוויק: "quik",
};

const servers = {
    ybitan: {
        retailers: 1131,
        branches: 1015,
    },

    carrefour: {
        retailers: 1540,
        branches: 2995,
    },

    quik: {
        retailers: 1541,
        branches: 2993,
    },

    // yuda: {
    //     retailers: 1492,
    //     branches: 2481,
    // },

    // victoryonline: {
    //     retailers: 1470,
    //     branches: 2550,
    // },
};

const createProductFilter = (subject) => {
    return {
        $and: [
            {
                $or: [
                    { name: { $regex: subject, $options: "i" } },
                    { category: { $regex: subject, $options: "i" } },
                ],
            },
            { isOutOfStock: false },
        ],
    };
};

const fetchProductsFromDb = async (filter, skip, limit) => {
    return await Product.find(filter).skip(skip).limit(limit).exec();
};

const processProductComparison = async (data) => {
    const cart = [];

    for (const product of data) {
        const foundProduct = await Product.findById(product.id);
        if (foundProduct) {
            cart.push({
                quantity: product.amount,
                prices: foundProduct.prices.map((price) => ({
                    market: price.market,
                    retailerProductId: price.retailerProductId,
                })),
            });
        }
    }

    return cart;
};

const createMarketCarts = (cart) => {
    const marketsCarts = {};

    cart.forEach((item) => {
        item.prices.forEach((price) => {
            const product = {
                quantity: item.quantity,
                retailerProductId: price.retailerProductId,
            };

            if (marketsCarts[price.market]) {
                marketsCarts[price.market].push(product);
            } else {
                marketsCarts[price.market] = [product];
            }
        });
    });

    return marketsCarts;
};

const fetchCartFromMarket = async (market, lines) => {
    const englishMarket = hebrewToEnglish[market];
    const server = servers[englishMarket];

    const response = await axios.post(
        `https://www.${englishMarket}.co.il/v2/retailers/${server.retailers}/branches/${server.branches}/carts?appId=4`,
        {
            lines,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return response.data.cart;
};

const compareProducts = async (req, res) => {
    const data = req.body;

    try {
        const cart = await processProductComparison(data);
        const marketsCarts = createMarketCarts(cart);

        const promises = Object.keys(marketsCarts).map(async (market) => {
            const cartData = await fetchCartFromMarket(
                market,
                marketsCarts[market]
            );

            return {
                market,
                id: cartData.id,
                price: cartData.totalPrice,
                outOfStock: cartData.lines
                    .filter((line) => !line.isProductOutOfStock)
                    .map((out) => out.text),
            };
        });

        const results = await Promise.all(promises);

        results.forEach(({ market, ...result }) => {
            marketsCarts[market] = result;
        });

        res.status(200).json(marketsCarts);
    } catch (error) {
        console.error("Error comparing:", error);
        res.status(500).send({ message: "Error comparing", error });
    }
};

const getProductsBySubject = async (req, res) => {
    const { subject } = req.params;
    const { page = 1, limit = 15 } = req.query;

    try {
        const filter = createProductFilter(subject);
        const skip = (page - 1) * limit;
        const products = await fetchProductsFromDb(filter, skip, limit);

        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching product data:", error);
        res.status(500).send({ message: "Error fetching product data", error });
    }
};

module.exports = {
    getProductsBySubject,
    compareProducts,
};
