const Market = require("../Models/Market");
const Product = require("../Models/Product");
const axios = require("axios");

const fetchMarketNames = async () => {
    const markets = await Market.find();
    const marketLookup = {};

    markets.forEach((market) => {
        marketLookup[market._id.toString()] = market;
    });

    return marketLookup;
};

const createProductFilter = (regex, isOutOfStock) => {
    const filter = {
        $and: [
            {
                $or: [
                    { brand: { $regex: regex } },
                    { categories: { $regex: regex } },
                    { name: { $regex: regex } },
                ],
            },
        ],
    };
    if (!isOutOfStock) {
        filter.$and.push({ isOutOfStock: false });
    }

    return filter;
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
                images: 1,
            },
        },
    ]);
};

const createMarketCarts = (cart) => {
    const marketsCarts = {};

    for (const price of cart[0].prices) {
        marketsCarts[price.market] = {
            cart: [],
            missing: [],
        };
    }

    cart.forEach((item) => {
        item.prices.forEach((price) => {
            if (price.retailerProductId) {
                const product = {
                    quantity: item.amount,
                    retailerProductId: price.retailerProductId,
                };

                marketsCarts[price.market].cart.push(product);
            } else {
                marketsCarts[price.market].missing.push(item);
            }
        });
    });

    return marketsCarts;
};

const fetchCartFromMarket = async (lines, server) => {
    if (lines.length === 0) {
        return { totalPrice: 0, id: 0 };
    }

    const response = await axios.post(
        `https://www.${server.englishName}.co.il/v2/retailers/${server.retailers}/branches/${server.branches}/carts?appId=4`,
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
        const markets = await Market.find();
        const marketsCarts = createMarketCarts(data);

        const promises = Object.keys(marketsCarts).map(async (market) => {
            const server = markets.find((server) => server.name === market);

            const cartData = await fetchCartFromMarket(
                marketsCarts[market].cart,
                server
            );

            return {
                market,
                url: `https://www.${server.englishName}.co.il/?loginOrRegister=${cartData.id}`,
                price: cartData.totalPrice,
                missing: marketsCarts[market].missing,
                logo: server.logo,
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
    const { page = 1, limit = 11, outOfStock = true } = req.query;

    try {
        const regexPattern = subject
            .split(/[\s,]+|(?<=\s|,)ו+/)
            .filter((match) => match)
            .join("|");

        const regex = new RegExp(regexPattern);
        const outOfStockFlag = outOfStock === "true";

        const filter = createProductFilter(regex, outOfStockFlag);
        const skip = (page - 1) * limit;
        const products = await fetchProductsFromDb(
            filter,
            regex,
            subject,
            skip,
            limit
        );

        const marketMap = await fetchMarketNames();

        products.forEach((product) =>
            product.prices
                .sort((a, b) =>
                    a.discountPrice && !b.discountPrice
                        ? -1
                        : b.discountPrice && !a.discountPrice
                        ? 1
                        : a.price && !b.price
                        ? -1
                        : !a.price && b.price
                        ? 1
                        : (a.discountPrice || a.price) -
                          (b.discountPrice || b.price)
                )
                .forEach((price) => {
                    price.logo = marketMap[price.market].logo;
                    price.market = marketMap[price.market].name;
                })
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
