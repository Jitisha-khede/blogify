import { Router } from 'express';
import { upload } from '../middlewares/multer.js';
import Comment from '../modals/comment.model.js';
import * as blogController from '../controller/blog.controller.js';
import { verifyJwt } from '../middlewares/authentication.js';

const router = Router();

router.route('/createBlog').post(verifyJwt,upload.single('coverImage') ,blogController.createBlog);

router.route('/updateBlog/:blogId').patch(verifyJwt,upload.single('coverImage'), blogController.updateBlog);

router.route('/getBlogById/:blogId').get(verifyJwt,blogController.getBlogById);

router.route('/getAllBlogs').get(verifyJwt,blogController.getAllBlogs);

router.route('/deleteBlog/:blogId').delete(verifyJwt,blogController.deleteBlog);

router.post('/comment/:blogId',async (req,res)=>{
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id
  });
  return res.redirect(`/blog/${req.params.blogId}`)
})

export default router;