import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import CompressIcon from '@mui/icons-material/Compress';

const Header = () => {
    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Container>
                <Toolbar disableGutters>
                    <CompressIcon sx={{ mr: 2 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        AI Image Compression
                    </Typography>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
