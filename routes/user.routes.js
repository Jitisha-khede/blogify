import { Router } from 'express';
import userController from '../controller/user.controller.js';
import { verifyJwt } from '../middlewares/authentication.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

// router.route('/signup').post(upload.single('profileImage'),userController.signupUser);
router.route('/signup').post(userController.signupUser);

router.route('/login').post(userController.loginUser);

router.route('/logout').get(verifyJwt,userController.logoutUser);

router.route('/getUserDetails').get(verifyJwt,userController.getUserDetails);

router.route('/getUserById/:id').get(userController.getUserById);

router.route('/deleteUser').delete(verifyJwt,userController.deleteUser);

router.route('/getAllUsers').get(userController.getAllUsers);

router.route('/updateUserDetails').patch(verifyJwt,userController.updateUserDetails);

router.route('/updateProfilePhoto').patch(upload.single('profileImage'), verifyJwt,userController.updateProfilePhoto);

router.route('/countStreak').get(verifyJwt,userController.countStreak);

export default router;