const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');   
const { home } = require('nodemon/lib/utils');

require('dotenv').config();
const mongoUrl = process.env.MONGO_URL;

const Blog = require('./modals/blog');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog')

const {checkForAuthenticationCookie} = require('./middlewares/authentication')

const app = express();
const PORT = process.env.PORT || 8000;

try{
    mongoose.connect(mongoUrl).then(()=>{
        console.log('mongoDB connected');
    })
}catch(e){
    console.log(e);
}


app.set('view engine','ejs');
app.set('views',path.resolve('./views'));

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));

app.get('/',async (req,res)=>{
    const allBlogs = await Blog.find({}); 
    res.render('home',{
        user: req.user,
        blogs: allBlogs
    });
});

app.use('/user',userRoute);
app.use('/blog',blogRoute);

app.listen(PORT,()=>console.log(`server started at port: ${PORT}`));