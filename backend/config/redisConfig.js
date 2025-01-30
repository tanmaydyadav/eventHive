const express = require('express');
const Redis = require("ioredis");
const router = express.Router();
const app = express();

const redis = new Redis({
    host: 'redis-14106.c8.us-east-1-2.ec2.redns.redis-cloud.com',
    password: "8DmQygmBuUZJGhtEyd3nXS4hwWAfHoLW",
    port: 14106
});

redis.on("connect", () => {
    console.log("Redis connected");
});

// Export the Redis instance
module.exports = redis;

