const express = require("express");
const router = express.Router();
const { createTicket,bookTicket ,lockSeat, cancelTicket} = require("../controllers/ticketController");
const { verifyJwt,checkRole } = require("../middlewares/verifyJwt");
const { check } = require("express-validator");

router.post("/create",verifyJwt,checkRole(0),createTicket);
router.post("/create-payment-intent",bookTicket);
router.post("/lock-seat",verifyJwt,lockSeat);
router.post("/cancel/:ticketId",verifyJwt,checkRole(0),cancelTicket)
module.exports = router;
