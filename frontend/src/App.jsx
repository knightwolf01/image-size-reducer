import { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ImageComparison from './components/ImageComparison';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [processedImage, setProcessedImage] = useState(null);

  const handleImageProcessed = (data) => {
    setProcessedImage(data);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container>
        <ImageUpload onImageProcessed={handleImageProcessed} />
        {processedImage && (
          <ImageComparison
            originalImage={processedImage.originalImage}
            compressedImage={processedImage.compressedImage}
            detectedRegions={processedImage.detectedRegions}
          />
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App
