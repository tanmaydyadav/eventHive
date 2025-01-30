const express = require("express");
// const upload = require("../middlewares/multer");
const { uploadMemory, getPublicMemories,getPrivateMemories, getPaginatedMemories } = require("../controllers/memoryController");
const {verifyJwt,checkRole} = require("../middlewares/verifyJwt");

const router = express.Router();

// Route to upload a memory
router.post("/upload",verifyJwt, uploadMemory);

// Route to fetch public memories for an event
router.get("/public", getPaginatedMemories);

//Route to fetch private memories for yourself
router.get("/private",verifyJwt,getPrivateMemories);
module.exports = router;
