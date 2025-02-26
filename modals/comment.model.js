import { Schema, default as mongoose } from 'mongoose';

const commentSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    blogId: {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    },
    content: {
        type: String,
        required : true
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replyToUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [
        { 
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        }
    ]
    
}, {timestamps: true});

const Comment = mongoose.model('Comment',commentSchema);

export default Comment;