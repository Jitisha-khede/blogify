import * as fuzz from 'fuzzball';
import Blog from '../modals/blog.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import apiError from '../utils/apiError.js';

export const searchBlogs = asyncHandler(async (req,res) => {
    const { query } = req.query;

    if(!query){
        throw new apiError (400, 'Search query is required!');
    }

    const blogs = await Blog.find();

    let results = [];
     blogs.forEach((blog) => {
        const lowerQuery = query.toLowerCase(); 
        const lowerTitle = blog.title.toLowerCase(); 
        const lowerTags = blog.tags.map(tag => tag.toLowerCase());

        const titleMatch = fuzz.ratio(lowerTitle,lowerQuery)>80;
        const tagsMatch = lowerTags.some((tag)=> fuzz.ratio(tag,lowerQuery)>80);

        if( titleMatch || tagsMatch){
            results.push(blog);
        }
    });

    res.status(200).json(
        new apiResponse(200,{blogs: results}, 'Blogs fetched successfully!')
    );
})