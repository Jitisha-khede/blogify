import {Router} from 'express';
import * as bookmarkController from '../controller/bookmark.controller.js'
import { verifyJwt } from '../middlewares/authentication.js';

const router = Router();

router.route('/addtobookmarks').post(verifyJwt, bookmarkController.addtobookmarks);

router.route('/removefromBookmarks').delete(verifyJwt, bookmarkController.removeFromBookmarks);

router.route('/getAllBookmarks').get(verifyJwt, bookmarkController.getAllBookmarks);

export default router;