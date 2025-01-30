const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser =require("body-parser");
const fileUpload = require("express-fileupload");
// app.use(fileUpload({ useTempFiles: true }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/' // Temporary directory for file uploads
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
const PORT = '4000';
app.get("/hello",async(req , res)=>{
    res.status(200).json("hello world");
})
app.use('/api/auth',require("./routes/auth"));
app.use("/api/events/",require("./routes/event"));
app.use("/api/seats/",require("./routes/seat"));
app.use("/api/ticket/",require("./routes/ticket"));
app.use("/api/security/",require("./routes/security"));
app.use("/api/memories/",require("./routes/memory"));
app.use('/api/salespersons', require('./routes/salesperson'));
app.use('/api/promo/',require("./routes/promoCode"));
app.listen(PORT,()=>{
    console.log("EventHive listening on port 4000");
})

