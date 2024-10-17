const Product = require("../Models/Product");
const User = require("../Models/User");

const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const favorites = await favoritesMapping(user.favorites);

        return res.status(200).send({ favorites });
    } catch (e) {
        return res.status(500).send({ message: "something went wrong" });
    }
};

const addFavorite = async (req, res) => {
    try {
        const { items, cartName } = req.body;
        const products = items.map((item) => {
            return { productId: item.id, quantity: item.amount };
        });

        const user = await User.findById(req.user.id);
        user.favorites.push({
            cartName,
            products,
        });

        await user.save();
        return res.status(201).send({ message: "success" });
    } catch (e) {
        return res.status(500).send({ message: "something went wrong" });
    }
};

const editFavorite = async (req, res) => {
    try {
        const { items, cartName, favoriteId } = req.body;

        const products = items.map((item) => ({
            productId: item.id,
            quantity: item.amount,
        }));

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const favorite = user.favorites.find(
            (favorite) => favorite.id === favoriteId
        );

        if (!favorite) {
            return res.status(400).send({ message: "Favorite not found" });
        }

        favorite.cartName = cartName || favorite.cartName;
        favorite.products = products || favorite.products;

        await user.save();

        return res
            .status(200)
            .send({ message: "Favorite updated successfully" });
    } catch (e) {
        return res.status(500).send({ message: "Something went wrong" });
    }
};

const favoritesMapping = async (favorites) => {
    const mappedFavorites = await Promise.all(
        favorites.map(async (favorite) => {
            const productsWithDetails = await Promise.all(
                favorite.products.map(async (product) => {
                    const productDetails = await Product.findById(
                        product.productId,
                        {
                            _id: 1,
                            name: 1,
                            prices: 1,
                            brand: 1,
                        }
                    );

                    if (productDetails) {
                        const { _id, ...rest } = productDetails;
                        return {
                            id: _id,
                            ...rest,
                        };
                    }
                    return null;
                })
            );

            return {
                id: favorite.id,
                cartName: favorite.cartName,
                products: productsWithDetails.filter((product) => product),
            };
        })
    );

    return mappedFavorites;
};

module.exports = { getFavorites, addFavorite, editFavorite, favoritesMapping };
