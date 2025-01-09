import { createHmac, randomBytes } from 'node:crypto';
import { Schema } from 'mongoose';
import { model } from 'mongoose';
import authentication from '../services/authentication.js';

const { createTokenForUser } = authentication

const userSchema = new Schema({
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
        default:'/images/default-user.png'
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
    if(!user.isModified('password')) return

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