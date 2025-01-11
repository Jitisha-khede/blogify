import apiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import Blog from '../modals/blog.model.js';
import User from '../modals/user.model.js';
import Comment from '../modals/comment.model.js';

export const addComment = asyncHandler(async (req,res) => {
    const {blogId, parentCommentId} = req.body;
    const {content} = req.body;

    if(!content){
        throw new apiError(400, 'Content is required!');
    }

    const commentData = {
        user: req.user._id,
        blogId,
        content
    }

    if(parentCommentId){
        const parentComment = await Comment.findById(parentCommentId).populate('user','fullName');
        if(!parentComment){
            throw new apiError(404, 'Parent comment not found');
        }

        commentData.parentComment = parentComment;
        commentData.replyToUser = parentComment.user._id;
        commentData.content = `@${parentComment.user.fullName} ${content}`;
    }

    const newComment = await Comment.create(commentData);
    res.status(201).json(
        new apiResponse(201, {comment: newComment} , 'Comment created successfully!')
    )
})

export const getComments = asyncHandler(async (req,res) => {
    const { blogId } = req.params;

    const comments = await Comment.find({blogId}).populate('user','fullName').populate('replyToUser','fullName').sort( {createdAt: -1} );

    const structuredComments = comments.map((comment) => ({
        id: comment._id,
        content: comment.content,
        user: comment.user.id,
        parentComment: comment.parentComment,
        replyToUser: comment.replyToUser?.name || null,
        blogId: comment.blogId,
        createdAt: comment.createdAt
    }));

    res.status(200).json(
        new apiResponse(200, {comments: structuredComments}, 'Comments fetched successfully!')
    )
})