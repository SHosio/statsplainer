import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';
import { NavBar } from './Navbar.jsx'
import { LandingPage } from './Landingpage.jsx';
import { HistoryPage } from './History.jsx';
import { DashboardPage  } from './Dashboard.jsx';
import Grid from '@mui/material/Grid2';
import { FinalPopUp } from './FinalPopUp';

export default function Router() {
  const location = useLocation();

  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [popUpDisplay, setPopUpDisplay] = useState(false);
  const [feedBackButton, setFeedbackButton] = useState(false);

  const [taskCompletion, setTaskCompletion] = useState(false);

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

        <Route path='/history' element={<HistoryPage />}/>
        <Route path='/dashboard' element={<DashboardPage setTaskCompletion={setTaskCompletion}/>} />
      </Routes>
    </Grid>
  )
}
