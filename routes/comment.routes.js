import { Router } from "express";
import * as commentController from '../controller/comment.controller.js'
import { verifyJwt } from "../middlewares/authentication.js";

const router = Router();

router.route('/addComment').post(verifyJwt, commentController.addComment);

router.route('/getComments/:blogId').get(commentController.getComments);

export default router;