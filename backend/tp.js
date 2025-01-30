const publisable_key = "pk_test_51QfNnkF7UkxkbrgCeNxhOTQmzpeYYCsp8F5u9QqSgB9kmcvmGbqfrsvphQCZVdyrO7dg30DH4autpYjZomEvZSrf00HKp28P10";
const secret_key = "sk_test_51QfNnkF7UkxkbrgCyMH8CKOCiyyk15i2feLbqqXFNCqCUTZNNwmAYoLnT8r84lVPhNmq4GxNmnzlS4F6ZbLDNhqN00ATkxqN6v";
const express = require("express");
const stripe = require("stripe")(secret_key); // Replace with your Stripe Secret Key
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint to create a payment intent
app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency } = req.body; // Amount should be in the smallest currency unit (e.g., cents for USD)
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Example: 5000 for $50.00
      currency: currency, // Example: 'usd'
      payment_method_types: ["card"], // Card is the default method
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Error creating payment intent:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
