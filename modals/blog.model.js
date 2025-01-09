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
        required: false
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},{timestamps: true});

const Blog = mongoose.model('blog',blogSchema);
export default Blog;