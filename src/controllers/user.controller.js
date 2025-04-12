import User from "../models/user.model.js"
import cloudinary from '../lib/cloudinary.js'

export const updateProfilePic = async (req, res) => {
    const { profilePic } = req.body
    const userId = req.user._id
    try {
        if (!profilePic) return res.status(400).json({ message: 'Profile picture is required' })
        
        const uploadResponse = await cloudinary.uploader.upload(profilePic, { 
            folder: 'mern-chatapp' 
        })
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        )
        res.status(200).json(updatedUser)   
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
        console.log(`Error in updateProfile controller : ${error.message}`)
    }
}