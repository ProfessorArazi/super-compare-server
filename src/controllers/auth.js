const bcrypt = require("bcrypt");
const User = require("../Models/User");
const mailSender = require("../utills/mail/mailSender");
const jwt = require("jsonwebtoken");
const { favoritesMapping } = require("./favorites");

const register = async (req, res) => {
    try {
        const { password } = req.body;

        const user = new User(req.body);
        user.password = await hashPassword(password);

        await user.save();

        mailSender(
            user.email,
            `${process.env.SERVER_URL}/api/auth/verify?id=${user.id}`
        );

        res.status(201).send({ id: user.id });
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).send({ message: "האימייל קיים במערכת" });
        }

        return res.status(400).send({ message: "invalid fields" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send({ message: "אימייל או סיסמה לא נכונים" });
    }

    if (user.status != "Active") {
        return res.status(400).send({ message: "משתמש לא מאומת" });
    }

    const token = generateToken(user);
    return res
        .status(200)
        .send({ token, favorites: await favoritesMapping(user.favorites) });
};

const verify = async (req, res) => {
    const { id } = req.query;

    if (
        !(await User.findOneAndUpdate(
            { _id: id, status: "Pending" },
            { status: "Active" }
        ))
    ) {
        return res.status(410).send({ message: "expired code" });
    }

    res.status(303).redirect(`${process.env.CLIENT_URL}?login=1`);
};

const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

const generateToken = (user) => {
    const data = { id: user.id };
    return jwt.sign(data, process.env.JWT_KEY);
};

module.exports = { register, login, verify };
