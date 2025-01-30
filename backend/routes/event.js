const express= require("express");
const {verifyJwt,checkRole} = require('../middlewares/verifyJwt');

const {
    getEvents,
    addEvent,updateEvent,deleteEvent,
    getPastSimilarEvents,getEvent
} = require('../controllers/eventController');
const { check } = require("express-validator");

const router = express.Router();
router.get("/get-events",getEvents);
router.get("/get-event/:id",getEvent);
router.post("/add-event",verifyJwt,checkRole(2),addEvent);
router.patch("/update-event/:id",verifyJwt,checkRole(2),updateEvent);
router.delete("/delete-event/:id",verifyJwt,checkRole(2),deleteEvent);
router.get("/get-past-events/",getPastSimilarEvents);
module.exports = router;