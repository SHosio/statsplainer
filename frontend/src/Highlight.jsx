import { useRef, useState, useEffect } from "react";
import html2canvas from 'html2canvas';

// Helper function to merge individual word boxes into boxes for lines
/* Sort boxes by Y then X coordinates and seperate with appropriate y distance
*  iterate through box array, where an array of lines are created using start of first word and end of last
*/
const mergeBoxesIntoLines = (wordBoxes) => {
  if (!wordBoxes || wordBoxes.length === 0) return [];

  wordBoxes.sort((a, b) => {
    if (Math.abs(a.y - b.y) > a.height / 2) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const boxes = [];
  let currentLineBox = null;

  for (const box of wordBoxes) {
    if (!currentLineBox) {
      currentLineBox = { ...box };
    } else {
      const yTolerance = Math.max(box.height, currentLineBox.height) / 2;
      if (Math.abs(box.y - currentLineBox.y) < yTolerance) {
        const rightEdge = Math.max(currentLineBox.x + currentLineBox.width, box.x + box.width);
        currentLineBox.x = Math.min(currentLineBox.x, box.x);
        currentLineBox.width = rightEdge - currentLineBox.x;
        currentLineBox.height = Math.max(currentLineBox.height, box.height);
        currentLineBox.y = Math.min(currentLineBox.y, box.y);
      } else {
        boxes.push(currentLineBox);
        currentLineBox = { ...box };
      }
    }
  }

  if (currentLineBox) {
    boxes.push(currentLineBox);
  }

  return boxes;
};

// Helper function to extract the exact part of any page/s
/* Uses difference of two rectangles dimensions to check if overlapping
*  If so returns the overlapping dimensions
*/
function getIntersection(rect1, rect2) {
  const x1 = Math.max(rect1.x, rect2.x);
  const y1 = Math.max(rect1.y, rect2.y);
  const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
  const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

  // no overlap
  if (x1 >= x2 || y1 >= y2) return null;

  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

export const Highlight = (containerRef, pageNumber, snipHighlightSwitch, scale, pageElementsRef ) => {
  // Needed for handleMouseDown to keep in down state
  const isDrawing = useRef(false);
  // Tracks start of highlight box drag point
  const startPoint = useRef({ x: 0, y: 0 });
  // Interim highlight state keeps track of most recent highlight information, needed for mouseUp to extract desired info
  const [currentHighlight, setCurrentHighlight] = useState(null);
  // Highlight information used for extracting info and sending back to PdfUplaod
  const [highlights, setHighlights] = useState([]);
  // Needed for pdf information extraction
  const [textLayerElements, setTextLayerElements] = useState([]);
  // Keeps track of words to be highlighted within Highlighting box
  const [highlightedBoxes, setHighlightedBoxes] = useState([]);
  // Used for highlight cleaning when transitioning to different page states
  const highlightReset = () => {
    setCurrentHighlight(null);
    setHighlightedBoxes([]);
    setHighlights([]);
  }

  const handleMouseDown = (e) => {
    highlightReset();
    const containerRect = containerRef.current.getBoundingClientRect();
    isDrawing.current = true;
    const x = e.clientX - containerRect.left + containerRef.current.scrollLeft;
    const y = e.clientY - containerRect.top + containerRef.current.scrollTop;
    startPoint.current = { x, y };
    setCurrentHighlight({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const currentX = e.clientX - containerRect.left + containerRef.current.scrollLeft;
    const currentY = e.clientY - containerRect.top + containerRef.current.scrollTop;

    const width = currentX - startPoint.current.x;
    const height = currentY - startPoint.current.y;

    if (Math.abs(width) == 1 || Math.abs(height) == 1) return;

    const newHighlight = {
      x: Math.min(startPoint.current.x, currentX),
      y: Math.min(startPoint.current.y, currentY),
      width: Math.abs(width),
      height: Math.abs(height),
    };

    setCurrentHighlight(newHighlight);

    // for throttling, will interfere with highlighting at certain positions
    if (currentX % 3 != 0) return;

    const { boxes: wordBoxes } = extractWordsAndBoxes(newHighlight);
    const boxes = mergeBoxesIntoLines(wordBoxes);
    setHighlightedBoxes(boxes);
    
  };

  const handleMouseUp = async () => {
    isDrawing.current = false;

    if (!currentHighlight || currentHighlight.width < 5 || currentHighlight.height < 5) {
      setCurrentHighlight(null);
      setHighlightedBoxes([]);
      return;
    }

    if (snipHighlightSwitch === "Highlight") {
      const { text, boxes: wordBoxes } = extractWordsAndBoxes(currentHighlight);
      const boxes = mergeBoxesIntoLines(wordBoxes);
      const newHighlight = { ...currentHighlight, text, boxes };
      setHighlights([newHighlight]);
    }

    const finalHighlightRect = { ...currentHighlight };

    if (snipHighlightSwitch === "Snip") {
      if (!pageElementsRef.current || !containerRef.current) {
        setHighlights([]);
        return;
      }

      const overlappingPages = [];
      const containerRect = containerRef.current.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop;
      const scrollLeft = containerRef.current.scrollLeft;

      // Find overlapping pages
      pageElementsRef.current.forEach((element, index) => {
        if (!element) return;

        const pageElementRect = element.getBoundingClientRect();
        const pageScrollRect = {
          y: pageElementRect.top - containerRect.top + scrollTop,
          x: pageElementRect.left - containerRect.left + scrollLeft,
          width: pageElementRect.width,
          height: pageElementRect.height
        };

        const intersection = getIntersection(finalHighlightRect, pageScrollRect);

        if (intersection) {
          overlappingPages.push({
            index: index,
            element: element,
            pageScrollRect: pageScrollRect,
            intersectionRect: intersection
          });
        }
      });

      if (overlappingPages.length === 0) {
        highlightReset(); 
        return;
      }

    try {
        // extracts pages highlighted, multiple or singular
        const pageCanvases = await Promise.all(
          overlappingPages.map(pageInfo =>
            html2canvas(pageInfo.element, {
              scale: scale,
              scrollX: 0, scrollY: 0,
              windowWidth: pageInfo.element.scrollWidth,
              windowHeight: pageInfo.element.scrollHeight,
            }).catch(err => {
              console.error(err);
              return null;
            })
          )
        );

        // used as template for extracted image to be put on
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = finalHighlightRect.width;
        finalCanvas.height = finalHighlightRect.height;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.scale(scale, scale);

        // Draws onto canvas from overlappingPages array
        overlappingPages.forEach((pageInfo, i) => {
          const pageCanvas = pageCanvases[i];
          if (!pageCanvas) return;

          const intersectionRect = pageInfo.intersectionRect;

          const srcX_unscaled = intersectionRect.x - pageInfo.pageScrollRect.x;
          const srcY_unscaled = intersectionRect.y - pageInfo.pageScrollRect.y;
          const srcWidth_unscaled = intersectionRect.width;
          const srcHeight_unscaled = intersectionRect.height;

          const srcX_clamped = Math.max(0, srcX_unscaled * scale);
          const srcY_clamped = Math.max(0, srcY_unscaled * scale);
          const srcWidth_clamped = Math.max(0, Math.min(srcWidth_unscaled * scale, pageCanvas.width - srcX_clamped));
          const srcHeight_clamped = Math.max(0, Math.min(srcHeight_unscaled * scale, pageCanvas.height - srcY_clamped));

          const destX_unscaled = intersectionRect.x - finalHighlightRect.x;
          const destY_unscaled = intersectionRect.y - finalHighlightRect.y;

          if (srcWidth_clamped > 0 && srcHeight_clamped > 0) {
            finalCtx.drawImage(
              pageCanvas,
              srcX_clamped,
              srcY_clamped,
              srcWidth_clamped,
              srcHeight_clamped,
              destX_unscaled,
              destY_unscaled,
              srcWidth_unscaled,
              srcHeight_unscaled
            );
          }
        });

        // used to normalise canvas by redrawing it onto new canvas adjusting for scale
        const correctlySizedCanvas = document.createElement('canvas');
        correctlySizedCanvas.width = finalHighlightRect.width * scale;
        correctlySizedCanvas.height = finalHighlightRect.height * scale;
        const correctlySizedCtx = correctlySizedCanvas.getContext('2d');
        if(!correctlySizedCtx) throw new Error("Failed context 2");
        correctlySizedCtx.drawImage(finalCanvas, 0, 0);

        const snippedImageDataUrl = correctlySizedCanvas.toDataURL('image/png');

        const newHighlightData = { ...finalHighlightRect, snippedImageDataUrl };
        setHighlights([newHighlightData]);

      } catch (error) {
        console.error(error);
        highlightReset();
      }
    }
    
    setCurrentHighlight(null);
  };
  
  /*
    Gets all span information from page in pdf: text within, location, etc
    splits words to be used for exact word capturing and their information
    Used for inner word highlighting and text exctraction
  */
  const extractWordsAndBoxes = (highlight) => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const extractedWords = [];
    const wordBoxes = [];
  
    textLayerElements.forEach((el) => {
      const text = el.textContent;
      const textNode = el.firstChild;
  
      if (!text || !textNode || textNode.nodeType !== Node.TEXT_NODE) return;
  
      const fullText = textNode.textContent;
      const maxOffset = fullText.length;
  
      const words = text.split(/\s+/);
      let searchStart = 0;
  
      words.forEach((word) => {
        const trimmedWord = word.trim();
        if (!trimmedWord) return;
  
        const wordIndex = fullText.indexOf(trimmedWord, searchStart);
        if (wordIndex === -1 || wordIndex >= maxOffset) return;
  
        try {
          const range = document.createRange();
  
          // Ensure start and end offsets are within bounds
          const startOffset = Math.max(0, Math.min(wordIndex, maxOffset));
          const endOffset = Math.max(0, Math.min(wordIndex + trimmedWord.length, maxOffset));
  
          // Only proceed if the range is valid
          if (startOffset < endOffset) {
            range.setStart(textNode, startOffset);
            range.setEnd(textNode, endOffset);
  
            const wordRect = range.getBoundingClientRect();
  
            const wordLeft = wordRect.left + containerRef.current.scrollLeft - containerRect.left;
            const wordTop = wordRect.top + containerRef.current.scrollTop - containerRect.top;
            const wordRight = wordLeft + wordRect.width;
            const wordBottom = wordTop + wordRect.height;
  
            const isOverlapping =
              wordRight > highlight.x &&
              wordLeft < highlight.x + highlight.width &&
              wordBottom > highlight.y &&
              wordTop < highlight.y + highlight.height;
  
            if (isOverlapping) {
              extractedWords.push(trimmedWord);
              wordBoxes.push({
                text: trimmedWord,
                x: wordLeft,
                y: wordTop,
                width: wordRect.width,
                height: wordRect.height,
              });
            }
          }
  
          // Advance search start index so we don't re-match same word
          searchStart = wordIndex + trimmedWord.length;
        } catch (err) {
          console.warn("Range error:", err.message);
        }
      });
    });
  
    return {
      text: extractedWords.join(" ").trim(),
      boxes: wordBoxes,
    };
  };
      

  useEffect(() => {
    const interval = setInterval(() => {
      const elements = Array.from(
        containerRef.current?.querySelectorAll(".react-pdf__Page__textContent span") || []
      );
      setTextLayerElements(elements);
    }, 500);
    return () => clearInterval(interval);
  }, [containerRef, pageNumber]);

  return {
    highlights,
    currentHighlight,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    highlightedBoxes,
    highlightReset
  };
};

