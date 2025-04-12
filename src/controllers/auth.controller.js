import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { generateToken } from '../lib/utils.js'

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    try {
        if (!fullname || !email || !password) return res.status(400).json({ message: 'All fields are required' })
        if (password.length < 6) return res.status(400).json({ message: 'Password must be atleast 6 characters' })

        const user = await User.findOne({ email });
        
        if (user) return res.status(400).json({ message: 'User with this email already exists' })
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
        })
        
        if (!newUser) return res.status(400).json({ message: 'Invalid user data' })       
            
        await newUser.save()
        generateToken(newUser._id, res)

        res.status(200).json({
            _id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
            profilePic: newUser.profilePic,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        })
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
        console.log(`Error in signup controller : ${error.message}`)
    }
}


export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) return res.status(400).json({ message: 'All fields are required' })

        const user = await User.findOne({ email })

        if (!user) return res.status(400).json({ message: 'Invalid credentials'} )
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials'} )
        
        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }) 
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
        console.log(`Error in login controlleer : ${error.message}`)
    }
}

export const logout = (req, res) => {
    try {
        res.cookie('chanomtalk_jwt', '', { maxAge: 0 })
        res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
        console.log(`Error in logout controller : ${error.message}`)
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' })
        console.log(`Error in checkAuth controller : ${error.message}`)
    }
}