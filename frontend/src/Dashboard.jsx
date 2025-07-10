import {Typography, Box} from '@mui/material';

import {PdfSidebar} from './PdfSidebar';
import {useLocation} from 'react-router-dom';


export const DashboardPage = ( {setTaskCompletion} ) => {
  const location = useLocation();
  const {file} = location.state || {};

  if (!file) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'white',
        }}
      >
        <Typography variant="h6">
          No PDF file specified
        </Typography>
      </Box>
    )
  }
  return (
    <PdfSidebar file={file} isFromDashboard={true} setTaskCompletion={setTaskCompletion}/>
  )
}
