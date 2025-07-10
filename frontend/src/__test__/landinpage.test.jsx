import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LandingPage } from '../Landingpage';

let mockSetPdfUploaded = vi.fn();
let mockSetUploadedFile = vi.fn();
let mockSetTaskCompletion = vi.fn();
let mockApiCallPost = vi.mocked(
    (await import('../ApiCalls')).apiCallPost
);
let mockIsDragActive = false;
let capturedOnDrop;

const createMockFile = (name, type, content = 'content') => {
    return new File([new Blob([content], { type })], name, { type });
};

vi.mock('react-pdf', () => ({
    pdfjs: {
        GlobalWorkerOptions: { workerPort: null },
    },
}));

vi.mock('pdfjs-dist/build/pdf.worker?worker', () => ({ default: vi.fn() })); 

vi.mock('../PdfSidebar', () => ({
    PdfSidebar: (props) => (
        <div data-testid="sidebar">
            File: {props.file?.name}
        </div>
    )
}));

vi.mock('../ApiCalls', () => ({
    apiCallPost: vi.fn(),
}));

vi.mock('react-dropzone', () => ({
    useDropzone: (options) => {
        capturedOnDrop = options.onDrop;
        return {
            getRootProps: (props = {}) => ({
                ...props,
                'data-testid': 'dropzone',
            }),
            getInputProps: (props = {}) => ({ ...props }),
            isDragActive: mockIsDragActive,
        };
    },
}));

const renderLanding = ( uploadedFile ) => {
    return render(
        <LandingPage
            uploadedFile={uploadedFile}
            setPdfUploaded={mockSetPdfUploaded}
            setUploadedFile={mockSetUploadedFile}
            setTaskCompletion={mockSetTaskCompletion}
        />
    );
};

describe('LandingPage Component', () => {
    it('PDF file dropped', async () => {
        mockIsDragActive = true;

        renderLanding(null);

        expect(screen.getByText('Drop the PDF here...')).toBeInTheDocument();
        expect(screen.queryByText('Upload PDF')).not.toBeInTheDocument();

        await act(async () => {
            await capturedOnDrop([createMockFile('test.pdf', 'application/pdf')]);
        });

        expect(mockSetPdfUploaded).toHaveBeenCalledWith(true);

        mockIsDragActive = false;
    });

    it('render PdfSidebar after file upload', () => {
        const mockExistingFile = createMockFile('existing.pdf', 'application/pdf');

        renderLanding(mockExistingFile);

        expect(screen.queryByText('Upload PDF')).not.toBeInTheDocument();

        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar).toBeInTheDocument();
    });

     it('error log on apicall fail', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const testError = new Error('Upload failed');
        mockApiCallPost.mockRejectedValue(testError);

        renderLanding(null);

        await act(async () => {
            await capturedOnDrop([createMockFile('fail.pdf', 'application/pdf')]);
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    });
});
