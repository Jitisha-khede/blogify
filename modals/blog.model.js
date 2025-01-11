import { Schema, default as mongoose } from 'mongoose';

const blogSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    coverImageUrl:{
        type: String,
        default: process.env.DEFAULT_BLOG_IMAGE,
        required: false
    },
    tags: {
        type: [String], 
        default: []
    },
    moodCategory: {
        type: [String],
        enum: ['Happy', 'Sad', 'Motivational', 'Inspiring', 'Exciting'],
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    upvotes: [
        { 
            type: mongoose.Schema.Types.ObjectId, ref: 'user'
        }
    ], 
    downvotes: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'user' 
        }
    ],
},{timestamps: true});

const Blog = mongoose.model('Blog',blogSchema);
export default Blog;