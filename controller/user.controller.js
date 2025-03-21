import apiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import User from '../modals/user.model.js';
import uploadOnCloudinary from '../utils/uploadToCloudinary.js';
import removeFromCloudinary from '../utils/deleteFromCloudinary.js'

const signupUser = asyncHandler( async (req,res)=>{
    try{
        const { userName, fullName, email, password } = req.body;

        if(!userName || !fullName || !email || !password) {
            throw new apiError(400, 'Name Email and Password are required!')
        }

        // const profileImagePath = req.file ? req.file.path : null;
        // const profileImage = profileImagePath ? await uploadOnCloudinary(profileImagePath):process.env.DEFAULT_USER_IMAGE;

        // if (!profileImage) {
        //     throw new apiError(500, 'Error uploading profile image.');
        // }

        const newUser = await User.create({
            userName,
            fullName,
            email,
            password,
            // profileImage
        });
        
        res.status(201).json(
            new apiResponse(201, { newUser }, 'user created successfully!')
        )
    }
    catch(err){
        console.error(err);
        throw new apiError(500,'internal server error');
    }
});

const loginUser = asyncHandler( async(req,res)=>{
    try{
        const { login, password } = req.body;
        // console.log(req.body);
        if (!login || !password ) {
            throw new apiError(500, 'Email/Username and password is required')
        }

        const user = await User.findOne({ 
            $or: [{ email: login }, { userName: login }] 
        });

        if (!user) {
            throw new apiError(404, 'User not found');
        }

        const token = await User.matchPasswordAndGenerateToken(user.email,password);
        // console.log(token); 
        res.cookie("token", token, {
            httpOnly: false, 
            secure: false, 
            sameSite: "strict", 
            maxAge: 60 * 60 * 1000, 
        });

        const loggedIn=await User.findById(user._id).select("-password -refreshToken")
        console.log(loggedIn);
        res.status(200).json(
            new apiResponse(200,{token,loggedIn},'user logged in successfully!')
        )
    }
    catch(error){
        throw new apiError(error.statusCode||500,error.message||"internal server error");
    }
});

const logoutUser = asyncHandler((req,res) => {
    try {
        
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", 
        });

        
        res.status(200).json(
            new apiResponse(200,{},"Logout successful")
        );

    } catch (error) {
        console.error("Error during logout:", error);
        throw new apiError(500,"Internal server error")
    }
})

const getUserDetails = asyncHandler(async(req,res) => {
    const _id=req.user._id
    try {
        const user=await User.findById(_id);
        if(!user){
            throw new apiError(404,"user not found login first")
        }
        return res.status(200).json(new apiResponse(200,{user:user},"user Details"))
       
      } catch (error) {
        console.error("Error retrieving courses:", error);
        throw new apiError(error.statusCode||500,error.message||"internal server error")
      }
});

const getUserById = asyncHandler(async(req,res) => {
    try{
        const { id } = req.params;
    const user =  await User.findById(id)
    if(!user){
        throw new apiError(404,'No user found with this id');
    }
    res.status(200).json(
        new apiResponse(200,{user},'User retrived successfully!')
    )
    }
    catch(error){   
        console.error("Error retrieving courses:", error);
        throw new apiError(error.statusCode||500,error.message||"internal server error")    
    }
});


const getAllUsers = asyncHandler(async(req,res) => {
    const users = await User.find({});
    if(!users){
        throw new apiError(404,'No users found');
    }
    res.status(201).json(
        new apiResponse(201,{users},'Users retrived successfully!')
    )
});

const deleteUser = asyncHandler((req,res) => {
    const id  = req.user._id;

    const deletedUser = User.findByIdAndDelete(id);
    if(!deletedUser){
        throw new apiError(404, 'user not found with this id');
    }

    res.status(200).json(
        new apiResponse(200,{},'User deleted successfully!')
    )
})

const updateUserDetails = asyncHandler(async (req, res) => {
    try {
        const _id = req.user._id; 
        const { fullName, email} = req.body;
        const existingUsersEmail = await User.find({
            $and: [{ email: email },  { _id: { $ne: _id } }]
        });

        if (existingUsersEmail.length > 0) {
            throw new apiError(409, "Email  already in use by another user.");
        }

        const currentUser = await User.findById(_id);
        if (!currentUser) {
            throw new apiError(404, "User not found.");
        }

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            { $set: { fullName: fullName, email: email||"" } },
            { new: true }
        );

        res.status(201).json(new apiResponse(201, updatedUser, "User details updated successfully."));
    } 
    catch (error) {
        console.error("Error updating user details:", error.message);
        throw new apiError(error.statusCode||500,error.message||"internal server error")
    }
});

const updateProfilePhoto = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const profileImagePath = req.file?.path;
        
        if (!profileImagePath) {
            throw new apiError(409, "Profile photo is required.");
        }
        const user=await User.findById(userId)
        if(!user){
            throw new apiError(404,"user not found ")
        }
       if (user.profileImage) {
         const deletePhoto=await removeFromCloudinary(user.profileImage)
       }
        const profileImageUrl = await uploadOnCloudinary(profileImagePath);
        if(!profileImageUrl){
            throw new apiError(500,"error while uploading photo to server")
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage: profileImageUrl },
            { new: true , select: '-password'}
        );

        if (!updatedUser) {
            throw new apiError(404, "User not found.");
        }

        return res.status(201).json(new apiResponse(201, updatedUser, "Profile photo updated successfully."));
    } catch (error) {
        throw new apiError(error.statusCode||500,error.message||"internal server error")
    }
});

const countStreak = asyncHandler(async(req,res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if(!user){
        throw new apiError(400,'No user found!');
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const lastReadDate = user.lastReadDate;
    if (lastReadDate) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); 
        
        if (lastReadDate.getDate() === yesterday.getDate() && 
            lastReadDate.getMonth() === yesterday.getMonth() && 
            lastReadDate.getFullYear() === yesterday.getFullYear()) {
            
            user.streak += 1; 
        } else {
            user.streak = 1; 
        }
    } else {
        user.streak = 1;
    }

    user.lastReadDate = today;
    if (user.isModified('streak')) { 
        await user.save();
    }

    res.status(200).json(
        new apiResponse(200, { streak: user.streak }, 'Streak updated successfully!')
    );
});

export default { loginUser,logoutUser, signupUser, getUserDetails, getUserById, deleteUser, getAllUsers, updateUserDetails, updateProfilePhoto, countStreak };
