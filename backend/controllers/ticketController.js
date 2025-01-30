

const pool = require("../config/db"); // Database connection
const cloudinary = require("../Cloudinary/cloud");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe Secret Key
const redis = require("../config/redisConfig");

// lock seat 
const lockSeat = async (req, res) => {
    const { event_id, category_id,seat_id } = req.body;
    let user_id= req.userId;
    if (!event_id || !category_id  || !seat_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Fetch an available seat for the category
        const seatQuery = `
            SELECT * FROM seats
            WHERE category_id = $1 AND seat_id=$2 AND event_id=$3 and is_booked = FALSE;
        `;
        const seatResult = await pool.query(seatQuery, [category_id,seat_id,event_id]);
        // console.log(seatResult.rows.l/ength);
        // if(seatResult.rows.length<1) return res.status(400).json({message:"seat is already booked"}); 
        let lockKey = `lock:seat:${seat_id}:${category_id}`;
    let isExist  = await redis.exists(lockKey);
        if (seatResult.rowCount === 0 || isExist) {
            return res.status(400).json({ error: "No available seats in this category" });
        }
        const lockTimeout = 600;  // Lock for 10 minutes
    //     // Attempt to set the lock if it doesn't already exist
        const isLocked = await redis.setnx(lockKey,'locked');
        if (isLocked) {
    //         // Set expiration for the lock (10 minutes)
            await redis.expire(lockKey, lockTimeout);

        }
        return res.status(200).json({
            message: "Seat locked successfully!",
            seat_id,category_id
        });
    } catch (error) {
        console.error("Error locking seat:", error.message);
        return res.status(500).json({ error: "Server error" });
    }
};
const seatIsLocked = async(req,res)=>{
  try {
    let {seat_id,category_id} = req.body;
    let lockKey = `lock:seat:${seat_id}:${category_id}`;
    let isExist  = await redis.exists(lockKey);
    return res.status(200).json(isExist);
  }catch(err){
    console.log(err.message);
    return res.status(500).json({err:"server errror"});
  }
}
const createTicket = async (req, res) => {
    try {
        let { amount, currency } = req.body; 
        let {event_id,user_id,seat_id,category_id} = req.body;
        const file = req.files.photo; 
    //    upload photo to cloud
    let confirmSeat= await pool.query(`update seats set is_booked =true where seat_id=$1 and category_id=$2`,[seat_id,category_id]);
    console.log("confirmed seat in seats");
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "EventHive/Tickets", 
        });
        // perform payment
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
          //   payment_method:payMethodId,
            payment_method_types: ["card"], // Accepts card payments
          });
  
        // Use the URL to save the ticket in the database
        const uploadedPhotoUrl = result.secure_url;
        const qrCode = Buffer.from(`${user_id}-${event_id}-${Date.now()}`).toString("hex");
        let confirmTicket =await pool.query("INSERT INTO tickets (event_id,user_id,seat_category_id ,seat_id,qr_code,uploaded_photo_url,payment_intent_id) values ($1,$2,$3,$4,$5,$6,$7)",[event_id,user_id,category_id,seat_id,qrCode,uploadedPhotoUrl,paymentIntent.id]);
        console.log("ticket booked successfully");
        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            message: "Ticket created successfully.",
            payment_intent_id:paymentIntent.id,
            uploadedPhotoUrl
        });
    } catch (error) {
        console.error("Error in ticket booking:", error.message);
        res.status(500).json({ error: "Server Error" });
    }
};
// only for payment testing 
const bookTicket = async(req,res)=> {
    const { amount, currency } = req.body; // Dummy amount in smallest unit (e.g., cents for USD)
    try {
      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method_types: ["card"], // Accepts card payments
      });
      let id = paymentIntent.id;
      console.log(paymentIntent.id);
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        message: "Payment Intent created successfully.",
      });
    } catch (err) {
      console.error("Error creating payment intent:", err.message);
      res.status(500).json({ error: err.message });
    }
}
const cancelTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const query = `SELECT * FROM tickets WHERE ticket_id = $1 and is_canceled=false`;
        const result = await pool.query(query, [ticketId]);
        // check whether user can cancel the ticket or not
        // if(result.rowCount<1) return res.status(400).json({msg:"ticket cannot cancelled or doesnot exists"})
        // console.log(result.rows[0].event_id)  ;
        // console.log(result.rows[0].user_id);

        let eventId = result.rows[0].event_id;
        const eventQuery = `SELECT event_date FROM events WHERE event_id = $1`;
        const eventResult = await pool.query(eventQuery, [eventId]);
        const eventDate = new Date(eventResult.rows[0].event_date);
        const currentDate = new Date();
        const timeDifference = eventDate - currentDate; 
        if (timeDifference < 48 * 60 * 60 * 1000) { // Less than 48 hours
      return res.status(400).json({ error: 'Cancellations not allowed within 48 hours of the event.' });
        }
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Ticket not found or already canceled' });
        }

        const { payment_intent_id } = result.rows[0];

        // 2. Process the refund
        const refund = await stripe.refunds.create({
            payment_intent: payment_intent_id,
            amount:10//add the amount
        });
        // 3. Mark the ticket as canceled in the database
        const updateQuery = `UPDATE tickets SET is_canceled = true WHERE ticket_id = $1`;
        await pool.query(updateQuery, [ticketId]);
        const getTicket = await pool.query(
            `SELECT * 
             FROM clients AS c 
             INNER JOIN tickets AS t 
             ON c.client_id = t.user_id 
             WHERE c.client_id = $1`, 
             [result.rows[0].user_id]
          );
        console.log(getTicket.rows);       
        let {seat_id,seat_cateogory_id,event_id} = getTicket.rows[0];   
        const unlockseat= `update seats set is_booked =false where seat_id=$1 and category_id=$2 and event_id =$3`;
        await pool.query(unlockseat,[seat_id,seat_cateogory_id,event_id]);
        // 4. Notify the user
        // sendRefundEmail(getTicket.rows[0].email,event_id);
        res.status(200).json({
            message: 'Ticket canceled and refunded successfully!',
            refund,
        });
    } catch (error) {
        console.error('Error canceling ticket:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
};
const sendRefundEmail = async (email, eventName) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            //update it later
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: 'noreply@eventhive.com',
        to: email,
        subject: 'Your Ticket Has Been Refunded',
        text: `Your ticket for the event "${eventName}" has been successfully canceled and refunded.`,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    createTicket,
    bookTicket,lockSeat,cancelTicket
};

// const createTicket = async (req, res) => {
//   const { user_id, event_id, seat_category_id } = req.body;
//   try {
//     // Get the Cloudinary URL from the uploaded file
//     const photoUrl = req.file.path;

//     // Generate a QR code (hex or base64 value) for the ticket
//     const qrCode = Buffer.from(`${user_id}-${event_id}-${Date.now()}`).toString("hex");

//     // Save the ticket details in the database
//     await pool.query(
//       "INSERT INTO tickets (event_id, user_id, seat_category_id, qr_code, uploaded_photo_url) VALUES ($1, $2, $3, $4, $5)",
//       [event_id, user_id, seat_category_id, qrCode, photoUrl]
//     );

//     res.status(201).json({ message: "Ticket created successfully", qrCode, photoUrl });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// module.exports = { createTicket };
