import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import { NavBar } from './Navbar.jsx'
import { LandingPage } from './Landingpage.jsx';

import { DashboardPage  } from './Dashboard.jsx';
import Grid from '@mui/material/Grid2';
import { FinalPopUp } from './FinalPopUp';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export default function Router() {
  const location = useLocation();

  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [popUpDisplay, setPopUpDisplay] = useState(false);
  const [feedBackButton, setFeedbackButton] = useState(false);
  const [showFeedbackSnackbar, setShowFeedbackSnackbar] = useState(false);

  const [taskCompletion, setTaskCompletion] = useState(false);

  // Check completed PDFs on mount and when popup closes
  useEffect(() => {
    const checkCompletedPdfs = () => {
      let completedPdfs = JSON.parse(localStorage.getItem('completedPdfs') || '{}');
      const completedCount = Object.keys(completedPdfs).length;
      if (completedCount >= 2) {
        if (!feedBackButton) setShowFeedbackSnackbar(true);
        setFeedbackButton(true);
      }
    };
    checkCompletedPdfs();
  }, [popUpDisplay]);

  useEffect(() => {
    if (taskCompletion) {
      setPopUpDisplay(true);
    }
  }, [taskCompletion]);
  
  return (
    <Grid
      sx={{
        display: 'flex',
        flexShrink: 0,
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: '#1F2023',
        height: '100vh',
        width: '100vw'
      }}
    >
      {popUpDisplay && (
        <FinalPopUp setPopUpDisplay={setPopUpDisplay} setFeedbackButton={setFeedbackButton}/>
      )}
      <NavBar pdfUploaded={pdfUploaded} setPdfUploaded={setPdfUploaded} setUploadedFile={setUploadedFile} page={location.pathname} feedBackButton={feedBackButton} setPopUpDisplay={setPopUpDisplay}/>
      <Routes>
        <Route path='/' element={<LandingPage setPdfUploaded={setPdfUploaded} setUploadedFile={setUploadedFile} uploadedFile={uploadedFile} setTaskCompletion={setTaskCompletion}/>}/>


        <Route path='/dashboard' element={<DashboardPage setTaskCompletion={setTaskCompletion}/>} />
      </Routes>
      <Snackbar open={showFeedbackSnackbar} autoHideDuration={6000} onClose={() => setShowFeedbackSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setShowFeedbackSnackbar(false)} severity="info">
          Feedback button unlocked! You can now view your learning summary and provide feedback.
        </MuiAlert>
      </Snackbar>
    </Grid>
  )
}
