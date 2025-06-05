import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
    Box, 
    Typography, 
    Button, 
    CircularProgress, 
    Paper,
    Slider,
    Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const ImageUpload = ({ onImageProcessed }) => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [quality, setQuality] = useState(60); // Default compression quality

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Show preview
        setPreview(URL.createObjectURL(file));
        setLoading(true);

        try {            
            const formData = new FormData();
            formData.append('image', file);
            formData.append('quality', quality);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/images/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true,
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });

            onImageProcessed(response.data);
        } catch (error) {
            console.error('Error uploading image:', error);
            let errorMessage = 'Error uploading image. ';
            if (error.response) {
                errorMessage += `Server responded with: ${error.response.data.message}`;
            } else if (error.request) {
                errorMessage += 'No response from server. Please check if the server is running.';
            } else {
                errorMessage += error.message;
            }
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [onImageProcessed]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxSize: 5242880, // 5MB
        multiple: false
    });

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Box
                {...getRootProps()}
                sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                        borderColor: 'primary.main'
                    }
                }}
            >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {isDragActive
                        ? 'Drop the image here...'
                        : 'Drag & drop an image here, or click to select'}
                </Typography>                <Typography variant="body2" color="textSecondary">
                    Supported formats: JPG, PNG (max 5MB)
                </Typography>
                <Stack spacing={2} direction="row" alignItems="center" sx={{ mt: 3, px: 2 }}>
                    <Typography variant="body2" color="textSecondary">High Compression</Typography>
                    <Slider
                        value={quality}
                        onChange={(e, newValue) => setQuality(newValue)}
                        aria-label="Compression Quality"
                        valueLabelDisplay="auto"
                        valueLabelFormat={value => `${value}%`}
                        min={10}
                        max={90}
                        marks={[
                            { value: 10, label: '10%' },
                            { value: 50, label: '50%' },
                            { value: 90, label: '90%' }
                        ]}
                    />
                    <Typography variant="body2" color="textSecondary">High Quality</Typography>
                </Stack>
                {loading && (
                    <CircularProgress sx={{ mt: 2 }} />
                )}
                {preview && !loading && (
                    <Box mt={2}>
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                objectFit: 'contain'
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default ImageUpload;
