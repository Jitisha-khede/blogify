import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const {sign, verify} = jwt;

const secret = process.env.SESSION_SECRET;

function createTokenForUser(user){
    const payload={
        _id:user.id,
        email : user.email,
        profileImageURL : user.profileImageURL,
        role : user.role
    };
    const token = sign(payload,secret,{ expiresIn: "2h" });
    return token
}

function validateToken(token){
    const payload = verify(token,secret);
    return payload;
}

export default {
    createTokenForUser,
    validateToken
}