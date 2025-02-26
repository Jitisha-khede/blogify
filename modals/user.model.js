import { createHmac, randomBytes } from 'node:crypto';
import mongoose, { Schema } from 'mongoose';
import { model } from 'mongoose';
import authentication from '../services/authentication.js';
import { type } from 'node:os';

const { createTokenForUser } = authentication

const userSchema = new Schema({
    userName:{
        type: String,
        required: true
    },
    fullName:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    salt:{
        type: String,
        
    },
    password:{
        type: String,
        required: true
    },
    profileImage:{
        type:String,
        default:process.env.DEFAULT_USER_IMAGE
    },
    bookmarks :[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Blog'
        }
    ],
    streak: {
        type: Number,
        default: 0
    },
    lastReadDate: {
        type: Date
    },
    role:{
        type: String,
        enum:['USER','ADMIN'],
        default:'USER'
    }
    },
    { timestamps:true }
);

userSchema.pre('save',function(next){
    const user = this;
    if(!user.isModified('password')) return next();

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256',salt).update(user.password).digest("hex");
    
    this.salt = salt;
    this.password = hashedPassword;

    next();
})

userSchema.static('matchPasswordAndGenerateToken', async function (email,password){
    const user = await this.findOne({email});
    if(!user) return false;

    const salt = user.salt;
    const hashedPassword = user.password;
    
    const userProvidedHash = createHmac('sha256',salt).update(password).digest("hex");

    if(hashedPassword!== userProvidedHash) throw new Error('Incorrect password');
    const token = createTokenForUser(user);
    return token;
});

const User = model('User', userSchema);

export default User;