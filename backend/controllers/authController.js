const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { query } = require("express");
const jwt_secret_token = "helloworld";

//register a new user;
// role of user -0 ,admin-1,guard-2
const registerUser = async(req, res )=> {
    const {username,password,email,phone,age,role} = req.body;
    try {
        const query = await pool.query("SELECT * FROM clients WHERE email= $1",[email]);
        const user =query.rows;
        if(user.length==0) {
            let salt = await bcrypt.genSalt(10);
            let pass = await bcrypt.hash(password, salt);
            const user =  {
                username,
                password:pass,
                email,phone,age,role:role===null?0:role
            }
            pool.query("INSERT INTO clients (username,password,email,phone_number,age,role) values ($1,$2,$3,$4,$5,$6)", [user.username,user.password,user.email,user.phone,user.age,user.role],(err)=> {
                if(!err) res.status(200).json({message:"user added to database"});
                else {
                    console.log(err);
                    return res.status(500).json({error:"Database error"});
                }
            });
        }else {
            return res.status(400).json("User already exists");
        }
    }catch(err) {
        console.log(err.message)
        return res.status(500).json("server error");
    }
}
const loginUser = async(req,res)=> {
    try {
       let {username,password} = req.body;
    const query = await pool.query("SELECT * from clients where username=$1",[username]);
    const user = query.rows;
    if(user.length!==0) {
        const passwordCompare =await bcrypt.compare(password,user[0].password);
        if(!passwordCompare) return res.status(404).json("user not found, passwrod error");
        const payLoad = {
                id:user[0].client_id,
                role:user[0].role
        }
        const authToken =  jwt.sign(payLoad,jwt_secret_token);
       return res.status(200).json({role:user[0].role, authToken});
    }else {
      return  res.status(400).json("user does not exists");
    }
    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}


module.exports ={
    registerUser,
    loginUser
}