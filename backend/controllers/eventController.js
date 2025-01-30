const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
// const { query } = require("express");
// const { all } = require("../routes/auth");

const getEvents = async(req ,res)=> {
try {
let allEvents =await pool.query("SELECT * FROM events");
console.log('success fetched all events');
return res.status(200).json(allEvents.rows);
}catch(err) {
    console.log(err.message);
    return res.status(500).json("server error");
}
}
const getEvent = async(req,res)=> {
    try {
        let id= req.params.id;
        const event = await pool.query("SELECT * FROM events where event_id=$1",[id]);
        res.json(event.rows);
    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}
const addEvent = async(req ,res)=> {
    try {
        let {event_name,event_description,event_date,venue}=req.body;
        let salesperson_id = req.userId;
        // console.log(salesperson_id);
        let query =await pool.query("INSERT into events (event_name,event_description,event_date,venue,salesperson_id) values ($1,$2,$3,$4,$5)",[event_name,event_description,event_date,venue,salesperson_id]);
        return res.status(200).json(query.rows);
        // return res.status(200).json("hello");
    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}
//need to perform the update event 
const updateEvent = async(req , res)=> {
    try {

    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}
const deleteEvent = async (req,res)=> {
    try {
        let {id} =req.params;
        let deleteQuery = await pool.query("DELETE FROM events where event_id = $1",[id]);
        return res.status(200).json("event deleted successfully");

    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}
//get past events 
const getPastSimilarEvents = async (req, res) => {
    const { event_name } = req.query; // Use query params to filter
    try {
        const query = `
           SELECT * 
           FROM events 
           WHERE event_name ILIKE '%' || $1 || '%' 
           AND event_date < NOW()
           ORDER BY event_date DESC;
        `;
        const json =  await pool.query(query, [event_name]);
        // console.log(json.r);
        const events = json.rows;
        console.log(events);
        res.status(200).json(events);
    } catch (err) {
        console.error("Error fetching past events:", err);
        res.status(500).json({ error: "Server error" });
    }
};


module.exports ={
    getEvents,getEvent,
    addEvent,updateEvent,deleteEvent,
    getPastSimilarEvents
}