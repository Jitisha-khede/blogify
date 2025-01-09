import User from '../modals/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiError from '../utils/apiError.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config();

export const verifyJwt=asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies.token;
        const decodedToken= jwt.verify(token,process.env.SESSION_SECRET);
        const user=await User.findById(decodedToken._id).select("-password");
        if(!user){
            throw new apiError(404,"not found");
        }
        req.user=user;
        next();   
    } catch (error) {
        console.error(error)
        if (error.name === "TokenExpiredError") {
            res.clearCookie("accessToken"); 
            throw new apiError(401, "Session expired. Please log in again.");
        }
        throw new apiError(404,"not found")
    }
})
