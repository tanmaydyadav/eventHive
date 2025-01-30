const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { query } = require("express");
const { all } = require("../routes/auth");
const jwt_secret_token = "helloworld";

const getAllSeatCategorysForSpecificEvent = async(req ,res)=> {
try {
    let event_id = req.params.event_id;
let allCategories =await pool.query("SELECT * FROM seat_categories where event_id=$1",[event_id]);
console.log('success fetched all events');
return res.status(200).json(allCategories.rows);
}catch(err) {
    console.log(err.message);
    return res.status(500).json("server error");
}
}
const deleteCategory = async(req,res)=> {
    try {
        let event_id =req.params.event_id;
        let category_id= req.params.category_id;
        const event = await pool.query("DELETE  FROM seat_categories where event_id=$1 and category_id=$2",[event_id,category_id]);
       return res.status(200).json("category deleted successfully");
    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}
const addCategory = async (req, res) => {
    try {
        let event_id = req.params.event_id;
        let { category_name, price, total_seats } = req.body;

        // Insert category
        const categoryQuery = `
            INSERT INTO seat_categories (event_id, category_name, price, total_seats)
            VALUES ($1, $2, $3, $4) RETURNING category_id;
        `;
        const categoryResult = await pool.query(categoryQuery, [event_id, category_name, price, total_seats]);

        const category_id = categoryResult.rows[0].category_id;

        // Pre-generate seats for the category
        const seatValues = [];
        for (let i = 0; i < total_seats; i++) {
            seatValues.push(`(${category_id}, ${event_id})`);
        }

        const seatQuery = `
            INSERT INTO seats (category_id, event_id)
            VALUES ${seatValues.join(", ")};
        `;
        await pool.query(seatQuery);

        console.log("Category and seats added successfully");
        return res.status(200).json({ message: "Category added successfully", category_id });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json("Server error");
    }
};

//need to perform the update event 
const updateCategory = async(req , res)=> {
    try {

    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}
const seatStatus = async(req,res)=> {
    try {
        let {category_id,event_id} = req.body;
        let query =await pool.query(`SELECT * FROM seats where category_id=$1 and event_id =$2`,[category_id,event_id]);
        return res.status(200).json(query.rows);
    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}
module.exports ={
    getAllSeatCategorysForSpecificEvent,addCategory,
    updateCategory,deleteCategory,seatStatus
}