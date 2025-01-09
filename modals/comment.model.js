import { Schema, default as mongoose } from 'mongoose';

const commentSchema = new Schema({
    content: {
        type: String,
        required : true
    },
    blogId:{
        type: Schema.Types.ObjectId,
        ref: 'blog'
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
}, {timestamps: true});

const Comment = mongoose.model('comment',commentSchema);

export default Comment;