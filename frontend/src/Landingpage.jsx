import { useCallback } from 'react';
import { Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useDropzone } from 'react-dropzone'
import { PdfSidebar } from './PdfSidebar';
import { apiCallPost } from './ApiCalls';


export const LandingPage = ({ uploadedFile, setPdfUploaded, setUploadedFile, setTaskCompletion }) => {

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setPdfUploaded(true);

      try {
        await apiCallPost('upload-PDF', file);
        console.log('success');
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });
  
  return (
    <>
      {!uploadedFile ? (
        <Grid
          {...getRootProps()}
          data-testid="dropzone"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '30vh',
            flex: 1,
            minWidth: '70vh',
            bgcolor: '#1F2023',
            margin: '20vh',
            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='40' ry='40' stroke='%23fff' stroke-width='4' stroke-dasharray='10%2c 20' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
            borderRadius: '40px',
            textAlign: 'center',
            padding: '2rem',
            gap: 2,
          }}
        >
          <input {...getInputProps()} />

          <Typography 
            color="white"
            sx={{
              fontSize:`clamp(2vh, 4vw, 5vh)`,
              fontWeight: "bold",
              marginBottom: "0.5rem",
              width: "100%",
              textAlign: "center",
            }}
          >
            {isDragActive ? 'Drop the PDF here...' : 'Upload PDF'}
          </Typography>
          <Typography 
            color="gray"
            sx={{
              fontSize:`clamp(2vh, 4vw, 5vh)`,
              fontWeight: "bold",
              marginBottom: "0.5rem",
              width: "100%",
              textAlign: "center",
            }}
          >
            Drag and drop or choose a file to upload
          </Typography>

          <Button 
            variant="outlined" 
            sx={{ 
              color: 'white',
              borderColor: 'white', 
              fontSize: `clamp(1.2vh, 2.5vw, 3vh)`,
              padding: `clamp(0.5vh, 1vw, 1.5vh) clamp(1vh, 2vw, 3vh)`,
            }}>
            Choose PDF File
          </Button>

        </Grid>
      ) : (
        <PdfSidebar file={uploadedFile} setTaskCompletion={setTaskCompletion} />
      )}
    </>
  );
};
