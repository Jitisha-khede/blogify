import apiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import User from '../modals/user.model.js';
import Blog from '../modals/blog.model.js';

export const addtobookmarks = asyncHandler(async (req,res) => {
    try{

        const {blogId} = req.body;
        const userId = req.user._id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json(
                new apiResponse(404, {}, 'Blog not found')
            );
        }
    
        const user = await User.findById(userId);
        
        if(user.bookmarks.includes(blogId)){
            res.status(400).json(
                new apiResponse(400,{},'Blog is already bookmarked')
            )
        }
        
        user.bookmarks.push(blogId);
        await user.save();

        res.status(200).json(
            new apiResponse(200,{user},'Blog bookmarked successfully!')
        )
    }
    catch (error) {
        console.error("Error while saving user:", error.message);
        res.status(500).json(
            new apiResponse(500, {}, 'Failed to bookmark the blog')
        )
    }
})

export const removeFromBookmarks = asyncHandler(async (req,res) => {
    const {blogId} = req.body;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
        return res.status(404).json(
            new apiResponse(404, {}, 'Blog not found')
        );
    }   

    const user = await User.findById(userId);
    user.bookmarks = user.bookmarks.filter((id) => id.toString() !== blogId);
    await user.save();

    res.status(200).json(
        new apiResponse(200,{},'Blog removed from bookmarks successfully!')
    )

})

export const getAllBookmarks = asyncHandler(async (req,res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('bookmarks');

    if (!user) {
        throw new apiError(404, 'User not found');
    }
    
    res.status(200).json(
        new apiResponse(200,{ bookmarks: user.bookmarks },'Bookmarks fetched successfully!')
    )
})