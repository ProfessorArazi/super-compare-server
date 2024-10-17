const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(401).send({ message: "Unauthorized" });
    }

    try {
        token = token.split(" ")[1];

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Unauthorized" });
            }

            req.user = decoded;
            next();
        });
    } catch (e) {
        return res.status(400).send({ message: "Bad token" });
    }
};

module.exports = { verifyToken };
