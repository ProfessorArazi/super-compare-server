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

const sortPrices = (products, marketMap) => {
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
};

const createProductFilter = (regex, isOutOfStock) => {
    const filter = {
        $and: [
            {
                $or: [{ name: regex }, { brand: regex }, { categories: regex }],
            },
        ],
    };
    if (!isOutOfStock) {
        filter.$and.push({ isOutOfStock: false });
    }

    return filter;
};

const fetchProductsFromDb = async (filter, regex, words, skip, limit) => {
    return await Product.aggregate([
        {
            $match: filter,
        },
        {
            $addFields: {
                score: {
                    $cond: {
                        if: { $regexMatch: { input: "$name", regex } },
                        then: 6,
                        else: {
                            $cond: {
                                if: { $regexMatch: { input: "$brand", regex } },
                                then: 5,
                                else: {
                                    $cond: {
                                        if: {
                                            $in: [regex.source, "$categories"],
                                        },
                                        then: 4,
                                        else: {
                                            $cond: {
                                                if: {
                                                    $regexMatch: {
                                                        input: "$name",
                                                        regex: words,
                                                    },
                                                },
                                                then: 3,
                                                else: {
                                                    $cond: {
                                                        if: {
                                                            $regexMatch: {
                                                                input: "$brand",
                                                                regex: words,
                                                            },
                                                        },
                                                        then: 2,
                                                        else: {
                                                            $cond: {
                                                                if: {
                                                                    $in: [
                                                                        words.source,
                                                                        "$categories",
                                                                    ],
                                                                },
                                                                then: 1,
                                                                else: 0,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            $sort: {
                score: -1,
                _id: 1,
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
                minPrice: 1,
                maxPrice: 1,
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
                    quantity: item.amount * price.unitResolution,
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
    const { page = 1, limit = 11, outOfStock = "true" } = req.query;

    try {
        const regexPattern = subject
            .split(/[\s,]+|(?<=\s|,)ו+/)
            .filter((match) => match)
            .join("|");

        const regex = new RegExp(subject, "i");
        const words = new RegExp(regexPattern, "i");

        const outOfStockFlag = outOfStock === "true";

        const filter = createProductFilter(words, outOfStockFlag);
        const skip = (page - 1) * limit;

        const [marketMap, products] = await Promise.all([
            fetchMarketNames(),
            fetchProductsFromDb(filter, regex, words, skip, limit),
        ]);

        sortPrices(products, marketMap);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching product data:", error);
        res.status(500).send({ message: "something went wrong" });
    }
};

const filterSales = (arr) => {
    const marketMap = {};

    arr.forEach((product) => {
        const market = product.hotSale.market.toString();
        if (!marketMap[market]) {
            marketMap[market] = [];
        }
        marketMap[market].push(product);
    });

    const result = [];
    const markets = Object.keys(marketMap);

    let addedItem = true;

    while (addedItem) {
        addedItem = false;

        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];

            if (marketMap[market].length > 0) {
                result.push(marketMap[market].shift());
                addedItem = true;
            }
        }
    }

    return result;
};

const filterByCategories = (arr, maxItems, maxByBrand) => {
    const usedValues = new Set();
    const brandCount = {};
    const result = [];

    for (let i = 0; i < arr.length && result.length < maxItems; i++) {
        const item = arr[i];
        const values = item.categories;
        const brand = item.brand;

        if (!brandCount[brand]) {
            brandCount[brand] = 0;
        }

        const hasCommonCategory = values.every((value) =>
            usedValues.has(value)
        );

        if (!hasCommonCategory && (!brand || brandCount[brand] < maxByBrand)) {
            result.push(item);
            values.forEach((value) => usedValues.add(value));
            brandCount[brand]++;
        }
    }

    return result;
};

const getPopularProducts = async (isOutOfStock, marketMap) => {
    const filter = { posSoldQty: { $gte: 500 } };

    if (!isOutOfStock) {
        filter.isOutOfStock = false;
    }

    const products = await Product.find(filter, {
        _id: 1,
        id: "$_id",
        name: 1,
        prices: 1,
        brand: 1,
        images: 1,
        minPrice: 1,
        maxPrice: 1,
        posSoldQty: 1,
        categories: 1,
    })
        .sort({ posSoldQty: -1 })
        .limit(30)
        .lean();

    const popular = filterByCategories(products, 16, 1);

    sortPrices(popular, marketMap);

    return popular;
};

const getHotSales = async (isOutOfStock, marketMap) => {
    const filter = { hotSale: { $ne: null } };

    if (!isOutOfStock) {
        filter.isOutOfStock = false;
    }

    const products = await Product.find(filter, {
        _id: 1,
        id: "$_id",
        name: 1,
        prices: 1,
        brand: 1,
        images: 1,
        minPrice: 1,
        maxPrice: 1,
        hotSale: 1,
        categories: 1,
    })
        .sort({ "hotSale.percentage": -1 })
        .limit(30)
        .lean();

    const sales = filterSales(filterByCategories(products, 16, 1));

    sales.forEach((sale) => {
        sale.hotSale.market = marketMap[sale.hotSale.market].name;
    });

    sortPrices(sales, marketMap);

    return sales;
};

const getHomePageContent = async (req, res) => {
    try {
        const { outOfStock = "true" } = req.query;
        const outOfStockFlag = outOfStock === "true";

        const marketMap = await fetchMarketNames();

        const [popular, hotSales] = await Promise.all([
            getPopularProducts(outOfStockFlag, marketMap),
            getHotSales(outOfStockFlag, marketMap),
        ]);

        res.status(200).json({ popular, hotSales });
    } catch (error) {
        console.error("Error fetching product data:", error);
        res.status(500).send({ message: "something went wrong" });
    }
};

module.exports = {
    getProductsBySubject,
    getHomePageContent,
    compareProducts,
};
