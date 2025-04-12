import Message from '../models/message.model.js'
import User from '../models/user.model.js'
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId, io } from '../lib/socket.js'

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user
        const users = await User.find({  _id: { $ne: loggedInUserId } }).select('-password')

        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
        console.log(`Error in getUsersForSidebar controller : ${error.message}`)
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id
        
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
        console.log(`Error in getMessages controller : ${error.message}`)
    }
}


export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params
        const senderId = req.user._id
        
        let imageUrl
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, { 
                folder: 'mern-chatapp' 
            })
            imageUrl = uploadResponse.secure_url
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save()

        // realtime message to receiver
        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)

            // send notification
            io.to(receiverSocketId).emit("notification", { newMessage })
        }

        res.status(201).json(newMessage)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
        console.log(`Error in sendMessage controller : ${error.message}`)
    }
}