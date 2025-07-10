import { Button, Box, Typography, Backdrop } from '@mui/material';

export const FinalPopUp = ({ setPopUpDisplay, setFeedbackButton }) => {

  return (
    <>
    <Backdrop
        open={true}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          zIndex: 99,
          position:"fixed",
          top:0,
          left:0,
          right:0,
          bottom:0,
        }}
      />

    <Box 
      sx={{ 
        display: 'flex', 
        gap: 2, 
        flexDirection: 'column', 
        justifyContent: 'centre', 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: `translate(-50%,-50%)`, 
        backgroundColor: 'rgb(31, 29, 29)', 
        borderRadius: 2, 
        zIndex: 100, 
        width: '30vw',
        padding: '4vh 6vw'
      }}>

      <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.6rem'}}>
        How was your experience?
      </Typography >


      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 1, mt: 2 }}>
        <Button variant="contained" onClick={() => {setPopUpDisplay(false); setFeedbackButton(true);}} >
            Complete Later
        </Button>
        <Button
            variant="contained"
            component="a"
            href="https://docs.google.com/forms/d/e/1FAIpQLSdWEFlG2ciIRUB7LchAd1K-ka8UUF8htg6ikMpG65t15E3dBA/formResponse"
            target="_blank"
            rel="noopener noreferrer"
            disabled={false}
        >
            Go to Feedback Form
        </Button>
      </Box>
    </Box>
    </>
  );
}
