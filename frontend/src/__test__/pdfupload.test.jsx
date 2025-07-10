import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdfUpload } from '../PdfUpload';
import * as HighlightHook from '../Highlight';

const mockSetSideBarTriggered = vi.fn();
const mockOnHighlightConfirm = vi.fn();
const mockHighlightCompletionFunc = vi.fn();
const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
const user = userEvent.setup();

const mockHighlightResult = {
    highlights: [],
    currentHighlight: null,
    handleMouseDown: vi.fn(),
    handleMouseMove: vi.fn(),
    handleMouseUp: vi.fn(),
    highlightedBoxes: [],
    highlightReset: vi.fn(),
};

const mockTextHighlight = {
    x: 50, y: 60, width: 200, height: 100, pageNum: 1,
    text: 'highlighted text',
    boxes: [{ x: 50, y: 60, width: 200, height: 100 }],
    snippedImageDataUrl: null
};

const renderPdfUpload = (props = {}) => {
    const defaultProps = {
        file: mockFile,
        setSideBarTriggered: mockSetSideBarTriggered,
        onHighlightConfirm: mockOnHighlightConfirm,
        highlightCompletionFunc: mockHighlightCompletionFunc,
        modeCompletion: false,
    };
    return render(<PdfUpload {...defaultProps} {...props} />);
};

vi.mock('react-pdf', () => ({
    Document: vi.fn(function MockDocument({ onLoadSuccess, children }) {
        globalThis.mockOnLoadSuccess = onLoadSuccess;
        return <div data-testid="document">{children}</div>;
    }),
    Page: vi.fn(({ pageNumber, scale, width }) => {
        return <div data-testid={`page-${pageNumber}`} scale={scale} width={width}>Page {pageNumber}</div>;
    }),
    pdfjs: {
        GlobalWorkerOptions: { workerPort: null },
    },
}));

vi.mock('pdfjs-dist/build/pdf.worker?worker', () => ({ default: vi.fn() }));

vi.spyOn(HighlightHook, 'Highlight').mockReturnValue(mockHighlightResult);


describe('<PdfUpload>', () => {
    it('zoom in and zoom out buttons', async () => {
        renderPdfUpload();

        act(() => { 
            globalThis.mockOnLoadSuccess?.({ numPages: 1 }); 
        });

        const zoomInButton = screen.getByTitle('Zoom In');
        const zoomOutButton = screen.getByTitle('Zoom Out');

        await user.click(zoomInButton);
        expect(screen.getByTestId('page-1')).toHaveAttribute('scale', '1.1');

        await user.click(zoomOutButton);
        expect(screen.getByTestId('page-1')).toHaveAttribute('scale', '1');
    });

    it('highlight and snip buttons', async () => {
        renderPdfUpload();

        const highlightButton = screen.getByTitle('Highlight Text');
        const snipButton = screen.getByTitle('Snip Image');

        await user.click(snipButton);
        expect(highlightButton).toBeEnabled();
        expect(snipButton).toBeDisabled();

        await user.click(highlightButton);
        expect(highlightButton).toBeDisabled();
        expect(snipButton).toBeEnabled();
    });

    it('confirmation popup highlight', async () => {
        renderPdfUpload();

        act(() => { 
            globalThis.mockOnLoadSuccess?.({ numPages: 1 }); 
        });

        act(() => {
            mockHighlightResult.highlights = [mockTextHighlight];
        });

        renderPdfUpload();

        const confirmButton = await screen.findByRole('button', { name: /confirm highlight/i });

        await user.click(confirmButton);

        expect(screen.queryByRole('button', { name: /confirm highlight/i })).not.toBeInTheDocument();
    });

    it('highlightCompletionFunc called on highlight and modeCompletion true', async () => {
        mockHighlightResult.highlights = [];

        renderPdfUpload({ modeCompletion: true });

        act(() => { 
            globalThis.mockOnLoadSuccess?.({ numPages: 1 }); 
        });

        act(() => {
            mockHighlightResult.highlights = [mockTextHighlight];
        });

        renderPdfUpload({ modeCompletion: true });

        expect(mockHighlightCompletionFunc).toHaveBeenCalledTimes(1);
    });
});
