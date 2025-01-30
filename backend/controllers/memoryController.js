const cloudinary = require("../Cloudinary/cloud");
const pool = require("../config/db");

const uploadMemory = async (req, res) => {
    try {
        const { user_id, event_id, is_public, media_type } = req.body;
        console.log(is_public);
        // Validate media type
        if (!['photo', 'video'].includes(media_type)) {
            return res.status(400).json({ error: "Invalid media type. Must be 'photo' or 'video'." });
        }

        // Validate if a file is uploaded
        if (!req.files || !req.files.media) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const file = req.files.media;

        // Upload the media file directly to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "EventHive/Memories",
            resource_type: media_type === 'video' ? "video" : "image",
        });
        // Insert memory into the database
        const query = `
            INSERT INTO memories (user_id, event_id, uploaded_media_url, media_type, is_public)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [user_id, event_id, result.secure_url, media_type, is_public || false];

        const dbResponse = await pool.query(query, values);

        res.status(200).json({
            message: "Memory uploaded successfully.",
            memory: dbResponse.rows[0],
        });
    } catch (error) {
        console.error("Error uploading memory:", error.message);
        res.status(500).json({ error: "Server Error" });
    }
};
const getPrivateMemories = async(req,res)=> {
    try {
        const { event_id } = req.query;
        let user_id = req.userId;
        // let {user_id} = req.body;
        console.log(user_id);
        // Fetch public memories for a specific event
        const query = `
            SELECT * FROM memories 
            WHERE is_public = FALSE AND  event_id = $1 AND user_id = $2
            ORDER BY uploaded_at DESC;
        `;
        const values = [event_id,user_id];

        const dbResponse = await pool.query(query, values);

        res.status(200).json({
            message: "Public memories retrieved successfully.",
            memories: dbResponse.rows,
        });
    } catch (error) {
        console.error("Error fetching public memories:", error.message);
        res.status(500).json({ error: "Server Error" });
    }
}
const getPublicMemories = async (req, res) => {
    try {
        const { event_id } = req.query;

        // Fetch public memories for a specific event
        const query = `
            SELECT * FROM memories 
            WHERE is_public = TRUE AND event_id = $1
            ORDER BY uploaded_at DESC;
        `;
        const values = [event_id];

        const dbResponse = await pool.query(query, values);

        res.status(200).json({
            message: "Public memories retrieved successfully.",
            memories: dbResponse.rows,
        });
    } catch (error) {
        console.error("Error fetching public memories:", error.message);
        res.status(500).json({ error: "Server Error" });
    }
};
const getPaginatedMemories = async (req, res) => {
    try {
        let { event_id,page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        const offset = (page - 1) * limit;

        const query = `SELECT * FROM memories WHERE is_public = true and event_id=$1 ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3;`;
        const countQuery = `SELECT COUNT(*) FROM memories WHERE is_public = true;`;

        const [memoriesResult, countResult] = await Promise.all([
            pool.query(query, [event_id,limit, offset]),
            pool.query(countQuery),
        ]);

        const totalMemories = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalMemories / limit);

        res.status(200).json({
            currentPage: page,
            totalPages,
            totalMemories,
            memories: memoriesResult.rows,
        });
    } catch (error) {
        console.error('Error fetching memories:', error.message);
        res.status(500).json({ error: 'Server Error' });
    }
};
module.exports = {
    uploadMemory,
    getPublicMemories,
    getPrivateMemories,getPaginatedMemories
};
