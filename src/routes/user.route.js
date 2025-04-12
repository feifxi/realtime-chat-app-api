import express from 'express'
import { updateProfilePic } from '../controllers/user.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.put('/profilepic', protectRoute, updateProfilePic)

export default router