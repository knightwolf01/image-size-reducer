import express from 'express';
import multer from 'multer';
import { uploadImage, getImage } from '../controllers/image.controller.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024  //5mb limit
    }
});

// Route to handle image upload
router.post('/upload', upload.single('image'), uploadImage);

// Route to get image details
router.get('/:id', getImage);

export default router;
