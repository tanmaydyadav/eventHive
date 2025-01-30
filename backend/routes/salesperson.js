const express = require('express');
const { 
    createSalesperson, 
    getSalespersons, 
    updateSalesperson, 
    deleteSalesperson 
} = require('../controllers/salespersonController');
const {verifyJwt,checkRole} = require('../middlewares/verifyJwt');
const { check } = require('express-validator');
const router = express.Router();

// Routes
router.post('/register',verifyJwt,checkRole(1), createSalesperson); // Add a new salesperson
router.get('/',verifyJwt,checkRole(1), getSalespersons); // Get all salespersons
router.put('/:id',verifyJwt,checkRole(1) ,updateSalesperson); // Update a salesperson
router.delete('/:id',verifyJwt,checkRole(1), deleteSalesperson); // Delete a salesperson

module.exports = router;
