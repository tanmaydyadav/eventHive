const jwt = require("jsonwebtoken");
const verifyJwt = (req,res,next)=>{
    const token = req.header('Authorization')?.split(" ")[1];
    if(!token) res.status(401).send({error:"please authenticate using a valid token"});
   try {
    const string = jwt.verify(token,process.env.JWT_TOKEN);
    console.log(string);
    req.userId = string.id;
    req.role= string.role;
    console.log(req.user + ' fetchuser')
    next();
   }catch(err){
    res.status(500).json({err:err.message});
   }
}
const checkRole = (roles) => {
    return (req, res, next) => {
        console.log(req.role);
        console.log(req.userId)
        if (!req.userId || roles!==req.role) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
}; 
module.exports = {verifyJwt,checkRole};
//for authorisation