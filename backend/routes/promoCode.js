const express = require("express");
const { applyPromoCode,addPromoCode } = require("../controllers/promoCodeController");
const { verify } = require("jsonwebtoken");
const {verifyJwt,checkRole} = require("../middlewares/verifyJwt");

const router = express.Router();
// add token after wards;

router.post("/apply-promo", verifyJwt,applyPromoCode);
router.post("/add-promo",verifyJwt,checkRole(2),addPromoCode);
module.exports = router;
