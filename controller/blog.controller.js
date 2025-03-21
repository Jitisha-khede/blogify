import apiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import uploadOnCloudinary from '../utils/uploadToCloudinary.js';
import removeFromCloudinary from '../utils/deleteFromCloudinary.js'
import Comment from '../modals/comment.model.js';
import Blog from '../modals/blog.model.js';
import User from '../modals/user.model.js';

export const createBlog = asyncHandler(async (req,res)=>{
    const {title,body, tags, moodCategory} = req.body;

    if(!title || !body){
        throw new apiError(400,'Title and body are required!');
    }

    let coverImage = process.env.DEFAULT_BLOG_IMAGE;
    if (req.file) {
        const coverImageUrl = req.file.path;
        coverImage = await uploadOnCloudinary(coverImageUrl);
    }

    if(!coverImage){
        throw new apiError(500,'Error in uploading blog cover Image');
    }

    const validCategories = ['Happy', 'Sad', 'Motivational', 'Inspiring', 'Exciting'];
    if (!moodCategory.every(category => validCategories.includes(category))) {
        throw new apiError(400, 'Invalid mood category');
    }

    const blog = await Blog.create({
        body,
        title,
        tags: Array.isArray(tags) ? tags : [],
        moodCategory,
        createdBy:req.user._id,
        coverImage
    })
    
    res.status(201).json(
        new apiResponse(201,{blog},'Blog created successfully!')
    );
});

export const getAllBlogs = asyncHandler(async (req,res) => {
    const blogs = await Blog.find();

    if(!blogs|| blogs.length === 0){
        throw new apiError(404,'No blogs found for logged in user');
    }

    const blogsWithComments = await Promise.all(
        blogs.map(async (blog) => {
            const commentCount = await Comment.countDocuments({ blogId: blog._id });
            return { ...blog, commentCount }; // Add comment count
        })
    );

    // console.log(blogsWithComments);

    res.status(201).json(
        new apiResponse(201,{blogs: blogsWithComments},'Blogs fetched successfully!')
    )
})

export const getUserBlogs = asyncHandler(async (req,res) => {
    const userId = req.user._id;

    const blogs = await Blog.find({ createdBy: userId}).sort({createdAt: -1});

    if(!blogs|| blogs.length === 0){
        throw new apiError(404,'No blogs found for logged in user');
    }

    res.status(201).json(
        new apiResponse(201,{blogs},'Blogs fetched successfully!')
    )
})

export const updateBlog = asyncHandler(async (req,res) =>{
    const userId = req.user._id;
    const {blogId} = req.params;

    const { title, body, tags, mood} = req.body;

    if (!blogId) {
        throw new apiError(400, "Blog ID is required.");
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
        throw new apiError(404, "User not found.");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new apiError(404, "Blog not found.");
    }

    if (blog.createdBy.toString() !== userId.toString()) {
        throw new apiError(403, "You are not authorized to update this blog.");
    }

    let coverImage = blog.coverImageUrl;
    if (req.file) {
        const coverImageUrl = req.file.path; 
        if (blog.coverImageUrl) {
            const deletePhoto=await removeFromCloudinary(blog.coverImageUrl)
        }
        coverImage = await uploadOnCloudinary(coverImageUrl); 
        if(!coverImage){
            throw new apiError(500, "Error uploading cover image.");
        }
    }

    const validCategories = ['Happy', 'Sad', 'Motivational', 'Inspiring', 'Exciting'];
    if (!mood.every(category => validCategories.includes(category))) {
        throw new apiError(400, 'Invalid mood category');
    }

    blog.title = title || blog.title;
    blog.body = body || blog.body;
    blog.coverImageUrl = coverImage;
    blog.moodCategory = mood || blog.moodCategory;

    if (tags) {
        blog.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }

    const updatedBlog = await blog.save();

    res.status(201).json(
        new apiResponse(201,{ updatedBlog },'Blog updated successfully!')
    )
});

export const getUserBlogById = asyncHandler( async (req,res) => {
    const {blogId} = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    if(!blog){
        throw new apiError(404, 'No blog found with this id')
    }
    // console.log(blog);
    if (blog.createdBy.toString() !== userId.toString()) {
        throw new apiError(403, 'You are not authorized to delete this blog');
    }

    res.status(200).json(
        new apiResponse(200,{blog},'Blog fetched successfully!')
    )
})

export const getBlogById = asyncHandler(async (req,res) => {
    const { blogId } = req.params;

    if(!blogId){
        throw new apiError(400,'Blog ID is required');
    }

    const blog = await Blog.findById(blogId);

    res.status(200).json(
        new apiResponse(200,{blog},'Blog fetched successfully!')
    )
});

export const deleteBlog = asyncHandler(async (req,res) => {
    const { blogId } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new apiError(404, 'Blog not found with this ID');
    }

    if (blog.createdBy.toString() !== userId.toString()) {
        throw new apiError(403, 'You are not authorized to delete this blog');
    }
    
    await blog.deleteOne();

    res.status(200).json(
        new apiResponse(200,{},'Blog deleted sucessfully!')
    );
});

export const voteBlog = asyncHandler(async (req,res) => {
    const { blogId,voteType } = req.body;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    if(!blog){
        throw new apiError (404,'Blog not found');
    }

    blog.upvotes = blog.upvotes.filter((id) => id.toString() !== userId.toString());
    blog.downvotes = blog.downvotes.filter((id) => id.toString() !== userId.toString());

    if (voteType === 'upvote') {
        blog.upvotes.push(userId);
    } else if (voteType === 'downvote') {
        blog.downvotes.push(userId);
    } else {
        throw new apiError(400, 'Invalid vote type');
    }

    await blog.save();

    res.status(200).json(
        new apiResponse(200,{
            upvotesCount: blog.upvotes.length,
            downvotesCount: blog.downvotes.length,
        },'vote updated successfully!')
    )
});

export const removeVote = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new apiError(404, 'Blog not found');
    }

    blog.upvotes = blog.upvotes.filter((id) => id.toString() !== userId.toString());
    blog.downvotes = blog.downvotes.filter((id) => id.toString() !== userId.toString());

    // If no change, return an error
    // if (prevUpvotesCount === blog.upvotes.length && prevDownvotesCount === blog.downvotes.length) {
    //     return res.status(400).json(new apiResponse(400, {}, 'No vote to remove.'));
    // }

    await blog.save();

    res.status(200).json(
        new apiResponse(200, {
            upvotesCount: blog.upvotes.length,
            downvotesCount: blog.downvotes.length,
        }, 'Vote removed successfully!')
    );
});

export const getBlogVotes = asyncHandler(async (req,res) => {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    // console.log(blog)
    if(!blog){
        throw new apiError (404,'Blog not found')
    }

    res.status(200).json(
        new apiResponse(200,{
            upvotesCount: blog.upvotes.length,
            downvotesCount: blog.downvotes.length,
        },'votes fetched successfully!')
    )
});

export const filterByMood = asyncHandler(async (req,res) => {
    const { mood } = req.query;

    if(!mood){
        throw new apiError(400,'Mood categories are required!')
    }

    const categories = mood.split(',');

    const validCategories = ['Happy', 'Sad', 'Motivational', 'Inspiring', 'Exciting'];
    if(!categories.every(category => validCategories.includes(category))){
        throw new apiError(400, 'invalid mood categories!')
    }

    const blogs = await Blog.find({ moodCategory: { $in: categories }});

    if(!blogs.length){
        throw new apiError(404,'No blogs found for the selected mood categories')
    }

    res.status(200).json(
        new apiResponse(200, {blogs}, 'Blogs filtered by selected mood categories')
    )
})