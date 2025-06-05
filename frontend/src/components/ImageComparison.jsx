import { 
    Box, 
    Paper, 
    Typography, 
    Grid, 
    Chip, 
    List, 
    ListItem, 
    ListItemText, 
    Button,
    Divider
} from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';

const ImageComparison = ({ originalImage, compressedImage, detectedRegions }) => {
    if (!originalImage || !compressedImage) return null;

    const compressionPercentage = (
        ((originalImage.size - compressedImage.size) / originalImage.size) * 100
    ).toFixed(2);

    const formatNumber = (num) => {
        return !isNaN(num) && num !== null ? Number(num).toFixed(1) : '0.0';
    };

    const formatConfidence = (confidence) => {
        // Convert confidence to percentage and ensure it's between 0-100
        const value = !isNaN(confidence) ? confidence * 100 : confidence;
        return formatNumber(value);
    };const getIconForType = (type) => {
        switch (type.toLowerCase()) {
            case 'face':
                return <FaceIcon />;
            case 'text':
                return <TextFieldsIcon />;
            default:
                return <ImageIcon />;
        }
    };

    const handleDownload = async (url, type) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${type}-image-${Date.now()}.jpg`; // You can customize the filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Error downloading image. Please try again.');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                AI-Powered Compression Results
            </Typography>
            <Typography color="textSecondary" gutterBottom>
                Size reduced by {compressionPercentage}%
            </Typography>
              {detectedRegions && detectedRegions.length > 0 && (
                <Box sx={{ mt: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Detected Regions ({detectedRegions.length})
                    </Typography>
                    <List>
                        {detectedRegions.map((region, index) => (
                            <ListItem key={index} sx={{ 
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                mb: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        icon={getIconForType(region.type)}
                                                        label={region.type || 'Unknown'}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                    <Typography variant="body1" color="primary.main" fontWeight="medium">
                                                        {region.description || `Region ${index + 1}`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    }
                                    secondary={                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" color="textSecondary" component="div">
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    gap: 2, 
                                                    flexWrap: 'wrap',
                                                    '& .metric': {
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        bgcolor: 'action.hover',
                                                        px: 1,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                    }
                                                }}>
                                                    <span className="metric">
                                                        <strong>Confidence:&nbsp;</strong>
                                                        <Chip 
                                                            label={`${formatConfidence(region.confidence)}%`}
                                                            size="small"
                                                            color={region.confidence > 0.8 ? "success" : "warning"}
                                                            variant="outlined"
                                                        />
                                                    </span>
                                                    <span className="metric">
                                                        <strong>Position:&nbsp;</strong>
                                                        {formatNumber(region.bbox?.x)}%, {formatNumber(region.bbox?.y)}%
                                                    </span>
                                                    <span className="metric">
                                                        <strong>Size:&nbsp;</strong>
                                                        {formatNumber(region.bbox?.width)}% × {formatNumber(region.bbox?.height)}%
                                                    </span>
                                                </Box>
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1">
                                Original Image ({(originalImage.size / 1024).toFixed(2)} KB)
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownload(originalImage.url, 'original')}
                                size="small"
                            >
                                Download
                            </Button>
                        </Box>
                        <Box
                            component="img"
                            src={originalImage.url}
                            alt="Original"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: 400,
                                objectFit: 'contain',
                                borderRadius: 1
                            }}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1">
                                Compressed Image ({(compressedImage.size / 1024).toFixed(2)} KB)
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownload(compressedImage.url, 'compressed')}
                                size="small"
                            >
                                Download
                            </Button>
                        </Box>
                        <Box
                            component="img"
                            src={compressedImage.url}
                            alt="Compressed"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: 400,
                                objectFit: 'contain',
                                borderRadius: 1
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ImageComparison;
