import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    originalImage: {
        url: { type: String, required: true },
        size: { type: Number, required: true },
        format: { type: String, required: true }
    },
    compressedImage: {
        url: { type: String, required: true },
        size: { type: Number, required: true }
    },
    compressionRatio: { type: Number },
    detectedRegions: [{
        type: { type: String },  
        bbox: {
            x: Number,
            y: Number,
            width: Number,
            height: Number
        },
        description: { type: String }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Image', imageSchema);
