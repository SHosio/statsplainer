import { Button, Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { getSessionSummary } from './ApiCalls';
import ReactMarkdown from 'react-markdown';

export const FinalPopUp = ({ setPopUpDisplay, setFeedbackButton }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get session summary when popup opens
    getSessionSummary()
      .then(data => {
        setSummary(data.summary);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to get session summary:', error);
        setSummary('Unable to generate session summary at this time.');
        setLoading(false);
      });
    // Get user_id from cookie
    const match = document.cookie.match(/user_id=([^;]+)/);
    if (match) setUserId(match[1]);
  }, []);

  // Google Form prefill URL
  const googleFormBase = "https://docs.google.com/forms/d/e/1FAIpQLSdWEFlG2ciIRUB7LchAd1K-ka8UUF8htg6ikMpG65t15E3dBA/viewform";
  // Replace ENTRY_ID with the actual entry ID for user_id in your Google Form
  const userIdEntryId = "2029882290";
  const googleFormUrl = `${googleFormBase}?entry.${userIdEntryId}=${encodeURIComponent(userId)}`;

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
        width: showSummary ? '60vw' : '30vw',
        maxHeight: '80vh',
        padding: '4vh 6vw',
        overflow: 'auto'
      }}>

      <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.6rem'}}>
        {showSummary ? 'Your Learning Summary' : 'How was your experience?'}
      </Typography >

      {showSummary ? (
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : (
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 1, 
              padding: 2,
              color: 'white',
              maxHeight: '50vh',
              overflow: 'auto'
            }}>
              <ReactMarkdown>{summary}</ReactMarkdown>
            </Box>
          )}
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 1, mt: 2 }}>
        {!showSummary ? (
          <>
            <Button variant="contained" onClick={() => {setPopUpDisplay(false); setFeedbackButton(true);}} >
                Complete Later
            </Button>
            <Button variant="contained" onClick={() => setShowSummary(true)} >
                View My Learning Summary
            </Button>
          </>
        ) : (
          <>
            <Button variant="contained" onClick={() => setShowSummary(false)} >
                Back to Feedback
            </Button>
            <Button variant="contained" component="a" href={googleFormUrl} target="_blank" rel="noopener noreferrer" >
                Go to Feedback Form
            </Button>
            <Button variant="contained" onClick={() => {setPopUpDisplay(false); setFeedbackButton(true);}} >
                Complete Session
            </Button>
          </>
        )}
      </Box>
    </Box>
    </>
  );
}
