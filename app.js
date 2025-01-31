import express, { urlencoded } from 'express';
import { connect } from 'mongoose';
import { existsSync, mkdirSync } from 'fs';
import cookieParser from 'cookie-parser';  
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors'

dotenv.config();

const mongoUrl = process.env.MONGO_URL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = join(__dirname, 'public', 'uploads');

if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 8000;

try{
    connect(mongoUrl).then(()=>{
        console.log('mongoDB connected');
    })
}catch(e){
    console.log(e);
}

app.use(cors({ origin: 'http://localhost:3000', credentials: true })); 

app.use(urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

//ROUTES
import userRoute from './routes/user.routes.js';
import blogRoute from './routes/blog.routes.js';
import searchRoute from './routes/search.routes.js';
import commentRoute from './routes/comment.routes.js';
import bookmarkRoute from './routes/bookmark.routes.js'

app.use('/api/user',userRoute);
app.use('/api/blog',blogRoute);
app.use('/api',searchRoute);
app.use('/api/comment',commentRoute);
app.use('/api/bookmark',bookmarkRoute);

app.listen(PORT,()=>console.log(`server started at port: ${PORT}`));