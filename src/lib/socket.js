import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

export const app = express()
export const server = http.createServer(app)

export const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
})

export const getReceiverSocketId = (userId) => {
    return userSocketMap[userId]
}

// used to store online users => { userId : socketId }  
const userSocketMap = {}    

// listening - For each user that connect
io.on('connection', (socket) => {
    const { userId } = socket.handshake.query;

    if (userId) userSocketMap[userId] = socket.id

    // console.log('A user connected: ', userId ,', socket: ',socket.id )

    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on('disconnect', () => {
        // console.log('A user disconnected : ', socket.id)
        delete userSocketMap[userId]
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})