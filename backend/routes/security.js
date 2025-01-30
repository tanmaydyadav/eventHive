const express = require("express");
const { scanQRCode } = require("../controllers/securityController");
const {verifyJwt,checkRole} = require("../middlewares/verifyJwt");

const router = express.Router();

router.post("/scan",verifyJwt,checkRole(2), scanQRCode);

module.exports = router;
