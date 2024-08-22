const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config()
const jwtSecret = process.env.JWT_SECRET;


const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(401).send("User is not authorized");
            }
            
            req.authdata = decoded.user;
            next();
        });
    } else {
        return res.status(401).send("Token is missing or invalid");
    }
});

module.exports = validateToken;
