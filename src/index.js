import express from 'express'
import { config } from 'dotenv';
import cookieParser from 'cookie-parser'
import cors from 'cors'

import connectDB from './lib/db.js';
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import messageRoutes from './routes/message.route.js'

import { app, server } from './lib/socket.js'

config();

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }))
}

app.use(express.json({ limit: '3mb' }))
app.use(cookieParser())


app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)



server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})