import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Box, IconButton  } from '@mui/material';
import Grid from '@mui/material/Grid2';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import { Highlight } from "./Highlight";
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import HighlightAltRoundedIcon from '@mui/icons-material/HighlightAltRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';

import worker from "pdfjs-dist/build/pdf.worker?worker";
pdfjs.GlobalWorkerOptions.workerPort = new worker();

export const PdfUpload = ({ file, setSideBarTriggered, onHighlightConfirm, highlightCompletionFunc, modeCompletion }) => { // Changed props: removed currentMode, addMessage; added onHighlightConfirm
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageScale, setPageScale] = useState(1);
  const [lastHighlightPoint, setLastHighlightPoint] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState(false);
  const [snipHighlightSwitch, setSnipHighlightSwitch] = useState("Highlight");
  const containerRef = useRef(null);
  const [isHorizontallyOverflowing, setIsHorizontallyOverflowing] = useState(false);

  //  on highlight trigger execute highlightCompletionFunc for parent
  const taskChecker = () => {
    if (modeCompletion === true) {
      highlightCompletionFunc();
    }
  };

  const pageElementsRef = useRef([]);
  const onDocumentLoadSuccess = ({ numPages: loadedNumPages }) => {
    setNumPages(loadedNumPages);
    setPageNumber(1);
    pageElementsRef.current = Array(loadedNumPages).fill(null);
  };
  
  const {
    highlights,
    currentHighlight,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    highlightedBoxes,
    highlightReset
  } = Highlight(containerRef, pageNumber, snipHighlightSwitch, pageScale, pageElementsRef);

  useEffect(() => {
    if (highlights.length > 0) {
      if (snipHighlightSwitch === "Snip") {
        setConfirmPopup(true);
        taskChecker();
      } else if (highlights[0].boxes.length > 0) {
        setConfirmPopup(true);
        taskChecker();
      }
      setLastHighlightPoint({
        x: highlights[0].x,
        y: highlights[0].y,
        width: highlights[0].width,
        height: highlights[0].height
      });
    } else {
      setConfirmPopup(false);
    }
  }, [highlights]);

  useEffect(() => {
    highlightReset();
    setIsHorizontallyOverflowing(false);
  }, [pageScale, numPages, snipHighlightSwitch, window.innerWidth, window.innerHeight])

  let windowWidth = window.innerWidth * (70 / 100) * 0.9;

  const changeZoom = (delta) => {
      setPageScale((prevScale) => Math.max(0.5, Math.min(prevScale + delta, 3.0)));
  };
  const zoomIn = () => changeZoom(0.1);
  const zoomOut = () => changeZoom(-0.1);

  // Fix's zoom bug
  const onPageRenderSuccess = useCallback((page) => {
    // Get the specific page element using the page number from the callback
    const pageElement = pageElementsRef.current[page.pageNumber - 1];

    // Check the container exists too
    if (pageElement && containerRef.current) {
      const pageElementWidth = pageElement.clientWidth;
      const containerElementWidth = containerRef.current.clientWidth;
      const overflows = pageElementWidth > containerElementWidth + 1;

      if (overflows) {
          setIsHorizontallyOverflowing(true);
      }
    }
  }, []);

  return (
    <Grid sx={{ 
      position: 'relative', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'lightgrey', 
      width: '100%', 
      height: '100%'
    }}>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          alignItems: isHorizontallyOverflowing ? 'flex-start' : 'center',
          overflow: 'auto',
          width: '100%',
          height: '100%',
          userSelect: "none",
          padding: '1vh 0'
        }}
        onMouseDown={(e) => {setConfirmPopup(false); handleMouseDown(e);}}
        onMouseMove={handleMouseMove}
        onMouseUp={(e) => {setConfirmPopup(false); handleMouseUp(e);}}
        ref={containerRef}
      >

        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          sx={{ display: 'flex', position: 'relative', flexDirection: 'column', alignItems: 'center', overflow: 'auto', width: '100%', height: '100%', userSelect: "none",}}
        >
          {Array.from({ length: numPages || 0 }, (_, index) => (
            <Box
              key={`page_container_${index + 1}`}
              ref={(el) => { if (el) pageElementsRef.current[index] = el; }}
              sx={{ marginBottom: '10px', position: 'relative', boxShadow: '0px 4px 8px rgba(0,0,0,0.2)' }}
            >
                <Page
                  pageNumber={index + 1}
                  scale={pageScale}
                  width={windowWidth}
                  onRenderSuccess={(page) => onPageRenderSuccess(page)}
                />
             </Box>
          ))}
        </Document>

        {currentHighlight && (
          <Box
            sx={{
              position: "absolute",
              border: "2px dashed rgba(0, 0, 255, 0.5)",
              borderRadius: 2,
              backgroundColor: "rgba(60, 60, 255, 0.1)",
              top: currentHighlight.y,
              left: currentHighlight.x,
              width: currentHighlight.width,
              height: currentHighlight.height,
            }}
          />
        )}

        {snipHighlightSwitch === "Highlight" && (//  This creates highlighting effect using element creation at word area. MUST be absolute
          highlightedBoxes.map((box, idx) => (
            <Box
              key={`highlighted-box-${idx}`}
              sx={{
                position: "absolute",
                top: box.y,
                left: box.x,
                width: box.width + (box.height * 0.1),
                height: box.height,
                backgroundColor: "rgba(0, 0, 255, 0.3)",
                borderRadius: 1,
              }}
            />))
        )}

      </Box>

      {confirmPopup && lastHighlightPoint && (
        <Box
          sx={{
            position: "absolute",
            border: "1px solid grey",
            borderRadius: 1,
            backgroundColor: "rgb(240, 240, 240)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: '4px',
            top: `${lastHighlightPoint.y - (containerRef.current?.scrollTop || 0) + lastHighlightPoint.height + 5}px`,
            left: `${lastHighlightPoint.x - (containerRef.current?.scrollLeft || 0) + lastHighlightPoint.width / 2 - 24}px`,
            zIndex: 100,
            boxShadow: '0px 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          <IconButton
            size="small"
            aria-label="confirm highlight"
            sx={{ backgroundColor: "lightgreen", '&:hover': { backgroundColor: 'darkgreen'}}}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onClick={() => {
              setConfirmPopup(false);
              setSideBarTriggered(true); // Keep this to show sidebar if needed
              // Prepare data for the callback
              const highlightData = highlights[0]; // Assuming highlights[0] exists when popup is shown
              let dataToSend = {};
              if (snipHighlightSwitch === "Highlight" && highlightData?.text) {
                  dataToSend = { type: 'text', text: highlightData.text };
              } else if (snipHighlightSwitch === "Snip" && highlightData?.snippedImageDataUrl) {
                  dataToSend = { type: 'image', imageUrl: highlightData.snippedImageDataUrl };
              }
              // Call the callback function passed from PdfSidebar
              if (Object.keys(dataToSend).length > 0) {
                 onHighlightConfirm(dataToSend);
              } else {
                 console.error("No valid highlight data to send.");
              }
            }}
          >
            <CheckRoundedIcon fontSize="small" sx={{ color: 'black'}}/>
          </IconButton>
        </Box>
      )}

      <Box sx={{ position: 'absolute', display: 'flex', gap: 1, zIndex: '10', top: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px', borderRadius: 1 }}>
         <IconButton size="small" onClick={() => setSnipHighlightSwitch("Highlight")} disabled={snipHighlightSwitch === "Highlight"} title="Highlight Text">
           <HighlightAltRoundedIcon color={snipHighlightSwitch === "Highlight" ? "primary" : "action"} />
         </IconButton>
         <IconButton size="small" data-testid="snip" onClick={() => setSnipHighlightSwitch("Snip")} disabled={snipHighlightSwitch === "Snip"} title="Snip Image">
           <PhotoCameraRoundedIcon color={snipHighlightSwitch === "Snip" ? "primary" : "action"} />
         </IconButton>
      </Box>
       <Box sx={{ position: 'absolute', display: 'flex', gap: 1, zIndex: '10', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px', borderRadius: 1 }}>
         <IconButton size="small" data-testid="zoom-in-button" onClick={zoomIn} disabled={pageScale >= 3} title="Zoom In">
           <ZoomInRoundedIcon />
         </IconButton>
         <IconButton size="small" data-testid="zoom-out-button" onClick={zoomOut} disabled={pageScale <= 0.5} title="Zoom Out">
           <ZoomOutRoundedIcon />
         </IconButton>
      </Box>
    </Grid>
  );
};
