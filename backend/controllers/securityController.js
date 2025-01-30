const pool = require("../config/db");

// Scan QR Code & get info regarding the qr code
const scanQRCode = async (req, res) => {
    const { qrCode } = req.body; // QR code value sent in the request

    try {
        // Check if the QR code exists and has not been scanned
        const query = await pool.query(
            "SELECT * FROM tickets WHERE qr_code = $1 AND scanned = FALSE",
            [qrCode]
        );

        if (query.rows.length === 0) {
            return res.status(400).json({sucess:false, message: "Invalid or already scanned QR Code." });
        }

        // Update the ticket to mark it as scanned
        await pool.query("UPDATE tickets SET scanned = TRUE WHERE qr_code = $1", [qrCode]);
        res.status(200).json({ sucess:true,message: "QR Code scanned successfully. Entry granted!" });
    } catch (error) {
        console.error("Error scanning QR Code:", error.message);
        res.status(500).json({ sucess:false,error: "Server error" });
    }
};
//get ticket info from qrcode 

module.exports = {
    scanQRCode,
};
