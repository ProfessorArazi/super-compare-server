const Product = require("../Models/Product");
const axios = require("axios");

const hebrewToEnglish = {
    "יינות ביתן": "ybitan",
    קרפור: "carrefour",
    קוויק: "quik",
    "סופר יודה": "yuda",
    ויקטורי: "victoryonline",
    "טיב טעם": "tivtaam",
};

const servers = {
    ybitan: {
        retailers: 1131,
        branches: 1015,
    },

    carrefour: {
        retailers: 1540,
        branches: 2998,
    },

    quik: {
        retailers: 1541,
        branches: 3106,
    },

    yuda: {
        retailers: 1492,
        branches: 2481,
    },

    victoryonline: {
        retailers: 1470,
        branches: 2550,
    },

    tivtaam: {
        retailers: 1062,
        branches: 924,
    },
};

const createProductFilter = (regex) => {
    return {
        $and: [
            {
                $or: [
                    { brand: { $regex: regex } },
                    { categories: { $regex: regex } },
                    { name: { $regex: regex } },
                ],
            },
            { isOutOfStock: false },
        ],
    };
};

const fetchProductsFromDb = async (filter, regex, query, skip, limit) => {
    return await Product.aggregate([
        {
            $match: filter,
        },
        {
            $addFields: {
                brandContainsQuery: {
                    $cond: {
                        if: { $ne: ["$brand", null] },
                        then: {
                            $eq: ["$brand", query],
                        },
                        else: false,
                    },
                },
                category1ContainsQuery: {
                    $regexMatch: {
                        input: { $arrayElemAt: ["$categories", 0] },
                        regex,
                    },
                },
                category2ContainsQuery: {
                    $regexMatch: {
                        input: { $arrayElemAt: ["$categories", 1] },
                        regex,
                    },
                },
                category3ContainsQuery: {
                    $regexMatch: {
                        input: { $arrayElemAt: ["$categories", 2] },
                        regex,
                    },
                },
                nameContainsQuery: {
                    $regexMatch: { input: "$name", regex },
                },
            },
        },
        {
            $sort: {
                brandContainsQuery: -1,
                category1ContainsQuery: -1,
                category2ContainsQuery: -1,
                category3ContainsQuery: -1,
                nameContainsQuery: -1,
                name: 1,
            },
        },
        { $skip: skip },
        { $limit: +limit },
        {
            $project: {
                _id: 0,
                id: "$_id",
                name: 1,
                prices: 1,
                brand: 1,
            },
        },
    ]);
};

const processProductComparison = async (data) => {
    const productIds = data.map((product) => product.id);

    const foundProducts = await Product.find({
        _id: { $in: productIds },
    });

    const productMap = {};

    foundProducts.forEach((product) => {
        productMap[product._id] = product;
    }, {});

    const cart = data
        .map((product) => {
            const foundProduct = productMap[product.id];
            if (foundProduct) {
                return {
                    quantity: product.amount,
                    prices: foundProduct.prices.map((price) => ({
                        market: price.market,
                        retailerProductId: price.retailerProductId,
                    })),
                };
            }
            return null;
        })
        .filter((item) => item !== null);

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
                url: `https://www.${hebrewToEnglish[market]}.co.il/?loginOrRegister=${cartData.id}`,
                price: cartData.totalPrice,
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
        const regexPattern = subject.split(" ").join(".*");
        const regex = new RegExp(regexPattern, "i");

        const filter = createProductFilter(regex);
        const skip = (page - 1) * limit;
        const products = await fetchProductsFromDb(
            filter,
            regex,
            subject,
            skip,
            limit
        );

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
