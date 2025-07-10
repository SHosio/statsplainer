import { useNavigate } from 'react-router-dom';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {useState, useEffect} from 'react';

export const HistoryPage = () => {

  const [pdfFiles, setPdfFiles] = useState([]);
  const navigate = useNavigate();

  const handlePdfClick = async (pdfName) => {
    try {
      //fetch pdf from backend api
      const response = await fetch(`http://localhost:5000/get-pdf/${encodeURIComponent(pdfName)}`, {
        method:"GET",
        credentials: "include"
      });

      const fileBlob = await response.blob();

      const file = new File([fileBlob], pdfName, {
        type: "application/pdf",
        lastModified: Date.now()
      });

      localStorage.setItem("selectedPdf", pdfName);

      const fileUrl = URL.createObjectURL(file);

      navigate("/dashboard", {
        state: {
          file: file,
          fileUrl: fileUrl,
          filename: pdfName
        }
      });

    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  // check if current pdf file has already been stored in localStorage
  useEffect(() => {
    try{
      const storedFiles = localStorage.getItem('pdf_files');

      // if storedFiles is null then return
      if (!storedFiles) {
        setPdfFiles([]);
        return;
      }

      let parsedFiles;

      try{
        parsedFiles = JSON.parse(storedFiles);
      } catch (parseError) {
        console.error("error parsing JSON:", parseError);
      }

      if (Array.isArray(parsedFiles)) {
        setPdfFiles(parsedFiles);
      } else {
        console.error("parsed data is not an array:", parsedFiles);
        setPdfFiles([]);
      }
    } catch (error) {
      console.error("error processing pdf_files:", error);
      setPdfFiles([]);
    }
  }, []);

  return (
    <Grid
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '40vh',
        flex: 1,
        minWidth: '70vh',
        bgcolor: '#464646',
        margin: '5vh',
        borderRadius: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        background: 'linear-gradient(145deg, #2c2c2c, #1a1a1a)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'left',
          height: '5vh',
          bgcolor: 'transparent',
          margin: '3vh 4vh 2vh 4vh',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '1.5rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        HISTORY
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '30vh',
          bgcolor: 'transparent',
          margin: '1vh 4vh 1vh 4vh',
          color: 'white',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          },
        }}
      >
        <List>
          {pdfFiles.length > 0 ? (
            pdfFiles.map((pdfName) => (
              <ListItem
                key={pdfName}
                button
                onClick={() => handlePdfClick(pdfName)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(5px)',
                    transition: 'all 0.3s ease',
                  },
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '1.5vh',
                  marginBottom: '0.5vh',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        color: 'white',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                      }}
                    >
                      {pdfName}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1rem',
                textAlign: 'center',
                padding: '20px',
              }}
            >
              No PDF files found in history
            </Typography>
          )}
        </List>
      </Box>
    </Grid>
);
};
