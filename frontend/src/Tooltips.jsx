import { Box, Button, Snackbar, Slide, Typography, Backdrop, IconButton } from '@mui/material';
import { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// list of steps for the tool tips 
// edit here to add more steps and content in each step
// position of the message box can be modifed by the position key
const tourGuide = [
  {
    target: 'pdf-section',
    content: 'To the left is the PDF section where you can view the pdf and click the arrow key located on the bottom ofthe screen to navigate between different pages.',
    slideDirection : 'down',
    position: {top: "30%",left: "50%"},
    arrowDirecton: "left",
  },
  {
    target: 'pdf-higlight text/image',
    content: 'You can switch between highlighting text/sentences or highlight images by clicking the button ',
    slideDirection : 'down',
    position: {top: "10%",left: "12%"},
    arrowDirecton: "left",
  },
  {
    target: 'pdf-zoom in and out',
    content: 'You can zoom in and out of the pdf by clicking the magnifier + to zoom in and - to zoom out',
    slideDirection : 'down',
    position: {top: "10%",left: "58%"},
    arrowDirecton: "right",
  },
  {
    target: 'sidebar-buttons',
    content: 'You can select between three different chat modes to help you understand the PDF better: Definition, Real World Analogy, and ELI5.',
    slideDirection : 'left',
    position: {top: "10%", right: "25%"},
    arrowDirecton: "right",
  },
  {
    target: 'message-response',
    content: 'This section will show the response to your highlighted sentences, providing definitions or statistical analyses based on your selection.',
    slideDirection : 'up',
    position: {top: "40%",right: "10%"},
    arrowDirecton: "right",
  },
  {
    target: 'chat-input',
    content: 'You can type and ask questions to the AI here. Press Enter to send your message.',
    slideDirection : 'right',
    position: {top: "96%",right: "25%"},
    arrowDirecton: "right",
  },
];

const highlight = [
    {
        target: "highlight-feature",
        content: "you can select between highlighting and image-snip, once you highlight or snipped an image from the pdf you've uploaded the sidebar will pop up on the right hand side",
        slideDirection: "left",
        position: {top: "18%", left: "30%"},
        arrowDirecton: "left",
    },
];


// tooltip bubble function that create a rectangular bubble with a
// dismiss button to guide through the user what each component does and how to interact with.
// takes in three parameter to manage the state of the tooltips whether we open it or close it. and assign a target component to it
export default function Tooltip({state,open, handleClose }) {
 // get the current step and update the step to progress to the next step
  const [currentStep, setCurrentStep] = useState(0);
 // show to backdrop to make the background dim
  const [showBackdrop, setShowBackdrop] = useState(false);
 // check the state whether the tooltip guide is on or off
  const [isTourActive, setTourActive] = useState(false);
  const steps = (state === "highlight") ? highlight : tourGuide;
  console.log(steps);
  useEffect(() => {
    if (open) {
      setShowBackdrop(true);
      setTourActive(true);
      setCurrentStep(0);
    } else {
        setShowBackdrop(false);
        setTourActive(false);
    }
  }, [open]);


  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCloseTour();
    }
  };


  const handleCloseTour = () => {
    // check if its closed if its not closed then we close the tooltip guide
    if (handleClose) handleClose();
  };


  return (
    <>

      <Backdrop
        open={showBackdrop}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          position:"fixed",
          top:0,
          left:0,
          right:0,
          bottom:0,
        }}
      />


    <Box
        sx={{
          position: 'fixed',
          ...steps[currentStep].position,
          zIndex: 1001,
          width: "300px",
          transform: `translate(-50%,-50%)`,
        }}
      >
        <Snackbar
          open={isTourActive}
          onClose={handleCloseTour}
          sx={{
            backgroundColor: 'transparent',
            borderRadius: '10px',
            position:"static",
            width: '100%',
            p: 0,
            boxShadow: 'none',
            '& .MuiSnackbarContent-root': {
              backgroundColor: '#37383C',
              borderRadius: '10px',
              boxShadow: 10,
              width: '100%',
              padding: '16px',
              margin: 0,
              position:"relative",
            }
          }}
        >
          <Slide
            key={currentStep}
            in={isTourActive}
            direction={steps[currentStep].slideDirection}
            timeout={500}
            mountOnEnter
            unmountOnExit
            
          >
            <Box
              sx={{
                width:"auto",
                
                color: 'white',
                borderRadius: '10px',
                padding: '16px',
                boxShadow: 10,
                backdropFilter: `blur(8px)`,
                postion: "relative",
                zIndex: 1001,
                "&::before" : {
                content: `""`,
                position: "absolute",
                width: "30px",
                height: "30px",
                backgroundColor: "#37383C",
                ...(steps[currentStep].arrowDirecton === "left" ? {
                    clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
                    backdropFilter: `blur(8px)`,
                    right: "100%",
                    top: "50%",
                    transform: `translateY(-50%)`,
                    borderRadius: "0 5px 5px 0",
                    marginRight: "5px",
                } : {
                    clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                    left: "100%",
                    top: "50%",
                    backdropFilter: `blur(8px)`,
                    transform: `translateY(-50%)`,
                    borderRadius: "5px 0 0 5px",
                    marginLeft: "5px",
                }),
              },

              }}
            >
              <Typography
                sx={{
                  wordBreak: 'break-word',
                  pb: 1,
                  whiteSpace: 'pre-wrap',
                  
                }}
              >
                {steps[currentStep].content}
              </Typography>




            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button
                size="small"
                onClick={handleCloseTour}
                startIcon={<CloseIcon />}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Dismiss
              </Button>
              <Button
                size="small"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </Box>
        </Slide>
      </Snackbar>
    </Box>
    </>
  );
}
