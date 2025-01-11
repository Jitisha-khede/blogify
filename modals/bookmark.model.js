import { Schema, default as mongoose } from 'mongoose';
import { type } from 'node:os';

const bookmarkSchema = new Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    blog: {
        type: mongoose.Schema.ObjectId,
        ref: 'Blog'
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Bookmark = mongoose.model('Bookmark',bookmarkSchema);