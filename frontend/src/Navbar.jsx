import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography, IconButton } from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';

export const NavBar = ({ page, pdfUploaded, setPdfUploaded, setUploadedFile, feedBackButton, setPopUpDisplay }) => {
  const buttonStyles = { 
    height: '80%',
    color: 'white',
    background: `linear-gradient(145deg, #0A85FF, #0066CC)`,
    borderRadius: 1,
    mx: 1,
    boxShadow: `0 4px 6px rgba(0,0,0,0.1)`,
    transition: `all 0.3s ease`,
    '&:hover': {
      background: `linear-gradient(145deg, #0066CC, #004C99)`,
      transform: `translateY(-2px)`,
      boxShaodw: `0 6px 12px rgba(0,0,0,0.15)`,
    },
    "&:active": {
      transform: `translateY(0)`,
      boxShadow: `0 2px 4px rgba(0,0,0,0.1)`,
    }
  };

  const feedbackButtonStyles = {
    ...buttonStyles,
    background: 'linear-gradient(145deg, #FF6B6B, #FF4757)',
    "&:hover": {
      background: `linear-gradient(145deg, #FF4757, #FF6B6B)`,
      transform: `translateY(-2px)`,
      boxShadow: `0 6px 12px rgba(0,0,0,0.15)`,
    }
  }

  const reset = () => {
    setPdfUploaded(false);
    setUploadedFile(null);
  }

  let nav = <></>;
  if (page === '/dashboard') {
    nav = (
      <IconButton color="inherit" variant="contained" onClick={() => reset()} component={Link} to="/" sx={buttonStyles} aria-label="Add New">
        <AddRoundedIcon />
      </IconButton>
    );
  } else {
    // Landing page - only show add new button if PDF is uploaded
    nav = (
      <>
        {pdfUploaded && (
          <IconButton color="inherit" variant="contained" onClick={() => reset()} component={Link} to="/" sx={buttonStyles} aria-label="Add New">
            <AddRoundedIcon />
          </IconButton>
        )}
      </>
    );
  }

  return (
    <AppBar position="static" sx={{ bgcolor: '#1F2023', boxShadow: 'none', height: '7.9vh', }}>
      <Toolbar
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          height: '7.9vh'
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontSize: '3vh', fontWeight: 'bold' }}>
          STATSPLAINER
        </Typography>
        <Box sx={{ height: '6vh', display: 'flex', alignItems: 'center' }}>
          {feedBackButton && (
            <IconButton color="inherit" variant="contained" onClick={() => setPopUpDisplay(true)} sx={feedbackButtonStyles} aria-label="Feedback">
              feedback
            </IconButton>
          )}
          {nav}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
