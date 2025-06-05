import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import Image from '../models/image.model.js';
import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type. Only JPG and PNG are allowed' });
        }

        // Get original image details
        const originalImage = sharp(req.file.buffer);
        const metadata = await originalImage.metadata();
        
        // Analyze image with AI for region detection
        const regions = await detectRegions(req.file.buffer);
        
        // Apply adaptive compression based on detected regions
        const quality = parseInt(req.body.quality) || 60; // Default to 60 if not provided
        const compressedBuffer = await compressImage(req.file.buffer, regions, quality);
        
        // Store compressed image (implementation depends on your storage solution)
        const compressedUrl = await storeImage(compressedBuffer);
        const originalUrl = await storeImage(req.file.buffer);

        // Create database record   
        const imageRecord = await Image.create({
            originalImage: {
                url: originalUrl,
                size: req.file.size,
                format: metadata.format
            },
            compressedImage: {
                url: compressedUrl,
                size: compressedBuffer.length
            },
            compressionRatio: compressedBuffer.length / req.file.size,
            detectedRegions: regions
        });

        res.status(201).json(imageRecord);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ message: 'Error processing image' });
    }
};

async function detectRegions(imageBuffer) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Convert buffer to base64
        const base64Image = imageBuffer.toString('base64');
          const prompt = `Analyze this image and detect important regions like faces, text, and objects.
        You must respond with ONLY a valid JSON array. Do not include any markdown formatting or explanation.
        The response should be a raw JSON array with this exact structure:
        [
            {
                "type": "face|text|object",
                "confidence": 0.0-1.0,
                "bbox": {
                    "x": number (percentage of image width),
                    "y": number (percentage of image height),
                    "width": number (percentage of image width),
                    "height": number (percentage of image height)
                },
                "description": "brief description of what was detected"
            }
        ]
        Important: Your entire response must be valid JSON. Do not wrap it in code blocks or markdown.`;
        
        const result = await model.generateContent({
            contents: [{
                parts: [
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Image
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            }]
        });
          const response = await result.response;
        let text = response.text();
        
        try {
            // Clean up markdown formatting if present
            if (text.includes('```json')) {
                text = text.split('```json')[1].split('```')[0].trim();
            } else if (text.includes('```')) {
                text = text.split('```')[1].split('```')[0].trim();
            }
            
            // Try to parse the cleaned text as JSON
            const regions = JSON.parse(text);
            
            // Validate the structure of each region
            if (Array.isArray(regions)) {
                const validRegions = regions.filter(region => 
                    region.type && 
                    region.bbox && 
                    typeof region.bbox.x === 'number' &&
                    typeof region.bbox.y === 'number' &&
                    typeof region.bbox.width === 'number' &&
                    typeof region.bbox.height === 'number'
                );
                
                console.log('Detected regions:', validRegions);
                return validRegions;
            }
            return [];
        } catch (parseError) {
            console.error('Error parsing AI response:', text);
            console.error('Parse error:', parseError);
            return [];
        }
    } catch (error) {
        console.error('Error detecting regions:', error);
        return [];
    }
}

async function compressImage(buffer, regions, quality = 60) {
    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();
        
        // Base compression settings using user-defined quality
        let compressionOptions = {
            quality: quality  // Use user-selected quality
        };
        
        // If we have detected regions, adjust quality based on importance
        if (regions && regions.length > 0) {
            // If important regions are detected, ensure minimum quality
            const minQuality = Math.max(quality, 40); // Never go below 40% quality for images with detected regions
            compressionOptions.quality = minQuality;
        }
        
        return await image
            .jpeg(compressionOptions)
            .toBuffer();
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

async function storeImage(buffer) {
    try {
        // Convert buffer to base64
        const b64 = Buffer.from(buffer).toString('base64');
        const dataURI = `data:image/jpeg;base64,${b64}`;
        
        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'ai-compression',
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });
        
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

export const getImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        res.json(image);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving image' });
    }
};
