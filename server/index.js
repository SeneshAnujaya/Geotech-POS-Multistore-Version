import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';


// IMPORT ROUTES
import authRouter from './routes/authRoute.js';
import productsRouter from './routes/productsRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import salesRouter from './routes/salesRoute.js';
import userRouter from './routes/userRoute.js';
import wholesaleClientRouter from './routes/wholesaleClientRoute.js';
import paymentRouter from './routes/paymentRoute.js';
import initialSetupRouter from './routes/initialsetupRoute.js';
import storeRouter from './routes/storeRoute.js';
import stockRouter from './routes/stockRoute .js';

dotenv.config();

const app = express();
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies
  }));

app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));



// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/category", categoryRouter);
app.use("/api/sales", salesRouter);
app.use("/api/user", userRouter);
app.use("/api/wholesaleClient", wholesaleClientRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/initialsetup", initialSetupRouter);
app.use("/api/stores", storeRouter);
app.use("/api/stocks", stockRouter);

app.get('/', (req, res) => {
    res.send('API is working');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

export default app;