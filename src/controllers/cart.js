const Market = require("../Models/Market");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { client } = require("../cache/redisClient");

const acquireLockWithRetry = async (key, maxRetries = 10, delay = 200) => {
    const lockKey = `${key}_lock`;
    let retries = 0;

    while (retries < maxRetries) {
        const isLocked = await client.set(lockKey, "locked", "NX", "EX", 2);
        if (isLocked) return lockKey;
        retries += 1;
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error("Could not acquire lock after multiple retries");
};

const releaseLock = async (lockKey) => {
    await client.del(lockKey);
};

const createMarketCarts = (cart) => {
    const marketsCarts = {};

    cart[0].prices.forEach((price) => {
        marketsCarts[price.market] = {
            cart: [],
            missing: [],
        };
    });

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
        { lines },
        { headers: { "Content-Type": "application/json" } }
    );

    return response.data.cart;
};

const compare = async (req, res) => {
    const { cartId } = req.params;

    if (!cartId || !(await client.exists(cartId))) {
        return res.status(404).json({ message: "Cart not found" });
    }

    let lockKey;
    try {
        lockKey = await acquireLockWithRetry(cartId);
        const cart = JSON.parse(await client.get(cartId));

        const markets = await Market.find();
        const marketsCarts = createMarketCarts(cart);

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
        res.status(500).json({ message: "Failed to compare prices" });
    } finally {
        if (lockKey) await releaseLock(lockKey);
    }
};

const getCart = async (req, res) => {
    const { cartId } = req.params;

    if (!cartId || !(await client.exists(cartId))) {
        return res.status(404).json({ message: "Cart not found" });
    }

    const cart = JSON.parse(await client.get(cartId));
    res.status(200).json(cart || []);
};

const updateCart = (cart, item, action) => {
    const productIndex = cart.findIndex((p) => p.id === item?.id);

    switch (action) {
        case "add":
            if (productIndex > -1) {
                cart[productIndex].amount += item.amount;
            } else {
                cart.push(item);
            }
            break;

        case "remove":
            if (productIndex > -1) {
                cart[productIndex].amount -= item.amount;
                if (cart[productIndex].amount <= 0) {
                    cart.splice(productIndex, 1);
                }
            }
            break;

        case "removeTotal":
            if (productIndex > -1) {
                cart.splice(productIndex, 1);
            }
            break;

        case "clear":
            cart.length = 0;
            break;

        default:
            throw new Error("Invalid action");
    }

    return cart;
};

const manageCart = async (req, res) => {
    let { cartId } = req.params;
    const { item, action } = req.body;

    if (!cartId || !(await client.exists(cartId))) {
        cartId = uuidv4();
        await client.set(cartId, JSON.stringify([]));
    }

    let lockKey;
    try {
        lockKey = await acquireLockWithRetry(cartId);
        const cart = JSON.parse(await client.get(cartId)) || [];
        const updatedCart = updateCart(cart, item, action);

        await client.set(cartId, JSON.stringify(updatedCart));
        res.status(200).json({
            message: "Cart updated successfully",
            cartId,
            cart: updatedCart,
        });
    } catch (error) {
        await client.del(cartId);
        res.status(500).json({ message: "Failed to update cart" });
    } finally {
        if (lockKey) await releaseLock(lockKey);
    }
};

module.exports = {
    getCart,
    manageCart,
    compare,
};
