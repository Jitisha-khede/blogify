import { Router } from 'express';
import * as searchController from '../controller/search.controller.js';

const router = Router();

router.route('/search').get(searchController.searchBlogs);

export default router;