import { Router } from 'express';
import { upload } from '../middlewares/multer.js';
import Comment from '../modals/comment.model.js';
import * as blogController from '../controller/blog.controller.js';
import { verifyJwt } from '../middlewares/authentication.js';

const router = Router();

router.route('/createBlog').post(verifyJwt,upload.single('coverImage') ,blogController.createBlog);

router.route('/updateBlog/:blogId').patch(verifyJwt,upload.single('coverImage'), blogController.updateBlog);

router.route('/getUserBlogById/:blogId').get(verifyJwt,blogController.getUserBlogById);

router.route('/getBlogById/:blogId').get(blogController.getBlogById);

router.route('/getUserBlogs').get(verifyJwt,blogController.getUserBlogs);

router.route('/getAllBlogs').get(blogController.getAllBlogs);

router.route('/deleteBlog/:blogId').delete(verifyJwt,blogController.deleteBlog);

router.route('/voteBlog').post(verifyJwt,blogController.voteBlog);

router.route('/deleteVote').delete(verifyJwt, blogController.removeVote);

router.route('/getBlogVotes/:blogId').get(verifyJwt,blogController.getBlogVotes);

router.route('/filterByMood').get(verifyJwt,blogController.filterByMood);

router.post('/comment/:blogId',async (req,res)=>{
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id
  });
  return res.redirect(`/blog/${req.params.blogId}`)
})

export default router;