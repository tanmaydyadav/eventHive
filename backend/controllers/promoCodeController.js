const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
// const { query } = require("express");
const jwt_secret_token = "helloworld";
const applyPromoCode = async (req, res) => {
    let user_id = req.userId;
    const {  promo_code, cart_total } = req.body;
    console.log(user_id,promo_code,cart_total);
    try {
        // Step 1: Fetch Promo Code Details
        const promo = await pool.query(
            `SELECT * FROM promo_codes WHERE code = $1 AND is_active = TRUE AND start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW())`,
            [promo_code]
        );

        if (promo.rows.length === 0) {
            return res.status(404).json({ message: "Invalid or expired promo code." });
        }
        const promoDetails = promo.rows[0];
        const promo_code_id=promoDetails.promo_code_id;
        // Step 2: Check User Usage
        const userUsage = await pool.query(
            `SELECT * FROM user_promo_code_usage WHERE user_id = $1 AND promo_code_id = $2`,
            [user_id,promo_code_id]
        );

        if (userUsage.rows.length > 0 && userUsage.rows[0].times_used >= promoDetails.user_limit) {
            return res.status(403).json({ message: "You have already used this promo code." });
        }
        let globalUsage;
        // Step 3: Check Global Usage Limit
        if (promoDetails.max_usage !== null) {
             globalUsage = await pool.query(
                `SELECT COUNT(*) AS usage_count FROM user_promo_code_usage WHERE promo_code_id = $1`,
                [promo_code_id]
            );

            if (parseInt(globalUsage.rows[0].usage_count) >= promoDetails.max_usage) {
                return res.status(403).json({ message: "Promo code usage limit reached." });
            }
        }

        // Step 4: Calculate Discount
        let discount = 0;
        if (promoDetails.discount_type === "flat") {
            discount = promoDetails.discount_value;
        } else if (promoDetails.discount_type === "percentage") {
            discount = (cart_total * promoDetails.discount_value) / 100;
        }

        const finalAmount = cart_total - discount;
        // Step 5: Record Promo Code Usage
        const checkQuery = `
            SELECT 1 
            FROM user_promo_code_usage 
            WHERE user_id = $1 AND promo_code_id = $2;
        `;
        const checkResult = await pool.query(checkQuery, [user_id, promo_code_id]);

        if (checkResult.rowCount > 0) {
            // If record exists, update the times_used
            const updateQuery = `
                UPDATE user_promo_code_usage
                SET times_used = times_used + 1
                WHERE user_id = $1 AND promo_code_id = $2;
            `;
            await pool.query(updateQuery, [user_id, promo_code_id]);
        } else {
            // If no record exists, insert a new record
            const insertQuery = `
                INSERT INTO user_promo_code_usage (user_id, promo_code_id, times_used)
                VALUES ($1, $2, 1);
            `;
            await pool.query(insertQuery, [user_id, promo_code_id]);
        }

        console.log("Promo code usage updated successfully");
        res.status(200).json({
            message: "Promo code applied successfully!",
            discount,
            finalAmount,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server Error" });
    }
};
// to do validation of each fields using express-validator
const addPromoCode = async(req,res)=>{
    let {code,discount_type,discount_value,max_usage,user_limit,start_date,end_date} =req.body;
    try {
        const codeCheck = await pool.query('SELECT * FROM promo_codes where code = $1',[code]);
        if(codeCheck.rows.length>0) {
            return res.status(400).json({message:"code already exists"});
        }
        const result = await pool.query(
            'INSERT INTO promo_codes (code,discount_type,discount_value,max_usage,user_limit,start_date,end_date) VALUES ($1,$2,$3,$4,$5,$6,$7)',[code,discount_type,discount_value,max_usage,user_limit,start_date,end_date] 
        );
        return res.status(200).json({message:'promo code added to database successfully'});
    }catch(err) {
        console.log(err.message);
        return res.status(500).json("server error");
    }
}
module.exports ={
  applyPromoCode,
  addPromoCode
}