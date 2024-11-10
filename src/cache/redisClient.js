const redis = require("redis");

const client = redis.createClient({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
});

client.on("error", (err) => {
    console.error("Redis Client Error", err);
});

async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
    }
}

async function disconnectRedis() {
    if (client.isOpen) {
        await client.disconnect();
    }
}

module.exports = { client, connectRedis, disconnectRedis };
