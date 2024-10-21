const User = require("../../Models/User");

const removeExpired = () => {
    setInterval(async () => {
        const halfHourAgo = new Date(Date.now() - 15 * 60 * 1000);
        try {
            const result = await User.deleteMany({
                status: "Pending",
                createdAt: { $lt: halfHourAgo },
            });

            console.log(`Number of documents deleted: ${result.deletedCount}`);
        } catch (e) {
            console.log(e);
        }
    }, 300000);
};

module.exports = { removeExpired };
