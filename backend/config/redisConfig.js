const express = require('express');
const Redis = require("ioredis");
const router = express.Router();
const app = express();

const redis = new Redis({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT
    
});

redis.on("connect", () => {
    console.log("Redis connected");
});

// Export the Redis instance
module.exports = redis;

