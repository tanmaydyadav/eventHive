const express= require("express");
const verifyJwt = require("../middlewares/verifyJwt"); 

const {
    loginUser,
    registerUser
} = require('../controllers/authController');

const router = express.Router();
router.post("/register",registerUser);
router.post("/login",loginUser);
// router.post("/admin-login",adminLogin);
// router.post("/login",loginUser);
module.exports = router;