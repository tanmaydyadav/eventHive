const express= require("express");
const {verifyJwt,checkRole} = require("../middlewares/verifyJwt"); 

const {
    getAllSeatCategorysForSpecificEvent,
    addCategory,updateCategory,deleteCategory,seatStatus
} = require('../controllers/seatController');

const router = express.Router();
router.get("/get-seats/:event_id",verifyJwt,checkRole(2),getAllSeatCategorysForSpecificEvent);
router.post("/add-category/:event_id",verifyJwt,checkRole(2),addCategory);
router.patch("/update-category/:event_id/:category_id",verifyJwt,checkRole(2),updateCategory);
router.delete("/delete-category/:event_id/:category_id",verifyJwt,checkRole(2),deleteCategory);
router.get("/seat-status",seatStatus);
module.exports = router;