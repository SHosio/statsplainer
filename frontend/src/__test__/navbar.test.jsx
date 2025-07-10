import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { NavBar } from '../Navbar.jsx'
import { BrowserRouter } from 'react-router-dom';

vi.mock('../apiCalls', () => ({
    apiCallPost: vi.fn(),
}));

vi.mock('react-pdf', () => ({
    Document: vi.fn(function MockDocument({ onLoadSuccess, children }) {
        globalThis.mockOnLoadSuccess = onLoadSuccess;
        return <div data-testid="mock-document">{children}</div>;
    }),
    Page: vi.fn(({ pageNumber, scale, width }) => {
        return <div data-testid={`mock-page-${pageNumber}`} data-scale={scale} data-width={width}>Page {pageNumber}</div>;
    }),
    pdfjs: {
        GlobalWorkerOptions: { workerPort: null },
    },
}));
vi.mock('pdfjs-dist/build/pdf.worker?worker', () => ({ default: vi.fn() }));

afterEach(() => {
    vi.clearAllMocks();
});

const setPdfUploaded = vi.fn();
const setUploadedFile = vi.fn();
const setPopUpDisplay = vi.fn();

const renderNav = ( pdfUploaded, page ) => {
    return render(
        <BrowserRouter>
            <NavBar
                pdfUploaded={pdfUploaded}
                setPdfUploaded={setPdfUploaded}
                setUploadedFile={setUploadedFile}
                page={page}
                feedBackButton={true}
                setPopUpDisplay={setPopUpDisplay}
            />
        </BrowserRouter>
    );
};

describe('<NavBar>', () => {
    const user = userEvent.setup();
    it('renders feedback button', async () => {
        renderNav(true, '/');

        const feedbackButton = screen.getByRole('button', { name: /feedback/i });
        expect(feedbackButton).toBeInTheDocument();

        await user.click(feedbackButton);

        expect(setPopUpDisplay).toHaveBeenCalledTimes(1);
        expect(setPopUpDisplay).toHaveBeenCalledWith(true);
    });

    it('renders on pdf page and resets on add click', async () => {
        renderNav(true, '/');

        const addNewButton = screen.getByRole('link', { name: /add new/i });
        expect(addNewButton).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /view history/i })).toBeInTheDocument();

        await user.click(addNewButton);

        expect(setPdfUploaded).toHaveBeenCalledTimes(1);
        expect(setPdfUploaded).toHaveBeenCalledWith(false);
        expect(setUploadedFile).toHaveBeenCalledTimes(1);
        expect(setUploadedFile).toHaveBeenCalledWith(null);
    });

    it('renders on history page and resets on add click', async () => {
        renderNav(true, '/history');

        const addNewButton = screen.getByRole('link', { name: /add new/i });
        expect(addNewButton).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /view history/i })).not.toBeInTheDocument();

        await user.click(addNewButton);

        expect(setPdfUploaded).toHaveBeenCalledTimes(1);
        expect(setPdfUploaded).toHaveBeenCalledWith(false);
        expect(setUploadedFile).toHaveBeenCalledTimes(1);
        expect(setUploadedFile).toHaveBeenCalledWith(null);
    });
});