import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { PdfSidebar } from '../PdfSidebar';
import * as ApiCalls from '../ApiCalls';

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

vi.mock('../PdfUpload', () => ({
    PdfUpload: vi.fn(({ setSideBarTriggered, onHighlightConfirm, highlightCompletionFunc }) => {
        globalThis.mockSetSideBarTriggered = setSideBarTriggered;
        globalThis.mockOnHighlightConfirm = onHighlightConfirm;
        globalThis.mockHighlightCompletionFunc = highlightCompletionFunc;
        return <div data-testid="pdf-upload">Mock PdfUpload</div>;
    }),
}));

vi.mock('../Sidebar', () => ({
    default: vi.fn(({ setChatType, isLoading, messageDefinition, messageRealWorldAnalogy, messageELI5, onHelpClick }) => {
        globalThis.mockSetChatType = setChatType;
        globalThis.mockOnHelpClick = onHelpClick;
        return (
            <div data-testid="sidebar">
                Mock Sidebar - Loading: {isLoading ? 'true' : 'false'}
                <div data-testid="def-msgs">{JSON.stringify(messageDefinition)}</div>
                <div data-testid="rwa-msgs">{JSON.stringify(messageRealWorldAnalogy)}</div>
                <div data-testid="eli5-msgs">{JSON.stringify(messageELI5)}</div>
            </div>
        );
    }),
}));

vi.mock('../Tooltips', () => ({
    default: vi.fn(({ state, open }) => (
        <div data-testid="tooltip">Mock Tooltip - State: {state} - Open: {open ? 'true' : 'false'}</div>
    )),
}));

vi.mock('react-resizable-panels', () => ({
    PanelGroup: vi.fn(({ children }) => <div data-testid="panel-group">{children}</div>),
    Panel: vi.fn(({ children }) => <div data-testid="panel">{children}</div>),
    PanelResizeHandle: vi.fn(() => <div data-testid="resize-handle"></div>),
}));

const mockApiCallPostText = vi.spyOn(ApiCalls, 'apiCallPostText');

const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

const mockSetTaskCompletion = vi.fn();

const renderComponent = (props = {}) => {
    const defaultProps = {
        file: mockFile,
        setTaskCompletion: mockSetTaskCompletion,
        isFromDashboard: false,
    };
    return render(<PdfSidebar {...defaultProps} {...props} />);
};

beforeEach(() => {
    renderComponent();
});

describe('<PdfSidebar />', () => {
    describe('initial render and tooltip', () => {
        it('sidebar not in initial render', () => {
            renderComponent();
            expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
            expect(screen.queryByTestId('panel-group')).not.toBeInTheDocument();
        });

        it('sidebar rendered when isFromDashboard is true and tooltip interact', () => {
            renderComponent({ isFromDashboard: true });
            expect(screen.getByTestId('panel-group')).toBeInTheDocument();
            expect(screen.getByTestId('sidebar')).toBeInTheDocument();

            act(() => { globalThis.mockOnHelpClick(); });

            waitFor(() => {
                expect(screen.getByTestId('tooltip')).toHaveTextContent('State: tourGuide - Open: true');
            });
        });
    });

    describe('Highlight Handling', () => {
        const textHighlightData = { type: 'text', text: 'Sample highlighted text' };
        const imageHighlightData = { type: 'image', imageUrl: 'data:image/png;base64,testimagedata' };

        beforeEach(() => {
            act(() => { globalThis.mockSetSideBarTriggered(true); });
        });

        it('text highlight that updates messages', async () => {
            mockApiCallPostText
                .mockResolvedValueOnce({ explanation: "Definition Response" })
                .mockResolvedValueOnce({ explanation: "Analogy Response" })
                .mockResolvedValueOnce({ explanation: "ELI5 Response" });

            act(() => { globalThis.mockOnHighlightConfirm(textHighlightData); });

            expect(screen.getByTestId('sidebar')).toHaveTextContent('Loading: true');

            expect(screen.getByTestId('def-msgs')).toHaveTextContent(JSON.stringify([{ text: textHighlightData.text, sender: "user" }]));

            await waitFor(() => {
                expect(screen.getByTestId('sidebar')).toHaveTextContent('Loading: false');
                expect(screen.getByTestId('def-msgs')).toHaveTextContent(JSON.stringify([
                    { text: textHighlightData.text, sender: "user" },
                    { sender: "AI", text: "Definition Response" }
                ]));
            });
        });

        it('image highlight that updates messages', async () => {
            mockApiCallPostText
                .mockResolvedValueOnce({ explanation: "Image Definition" })
                .mockResolvedValueOnce({ explanation: "Image Analogy" })
                .mockResolvedValueOnce({ explanation: "Image ELI5" });

            act(() => { globalThis.mockOnHighlightConfirm(imageHighlightData); });

            expect(screen.getByTestId('sidebar')).toHaveTextContent('Loading: true');

            expect(screen.getByTestId('def-msgs')).toHaveTextContent(JSON.stringify([{ sender: "user", type: "image", imageUrl: imageHighlightData.imageUrl }]));
        });

        it('API error during highlight fetching', async () => {
            const error = new Error("API Failed");
            mockApiCallPostText.mockRejectedValue(error);

            act(() => { globalThis.mockOnHighlightConfirm(textHighlightData); });

            expect(screen.getByTestId('sidebar')).toHaveTextContent('Loading: true');

            await waitFor(() => {
                expect(screen.getByTestId('sidebar')).toHaveTextContent('Loading: false');
                const errorMessage = { sender: "AI", text: "Sorry, an error occurred fetching explanations." };
                expect(screen.getByTestId('def-msgs')).toHaveTextContent(JSON.stringify([
                    { text: textHighlightData.text, sender: "user" },
                    errorMessage
                ]));
            });
        });
    });

    describe('task completion', () => {
        it('modeCompletion set to true after visiting all 3 modes', () => {
            act(() => { globalThis.mockSetSideBarTriggered(true); });

            act(() => { globalThis.mockSetChatType('Real world analogy'); });
            act(() => { globalThis.mockSetChatType('ELI5'); });

            act(() => { globalThis.mockOnHighlightConfirm({ type: 'text', text: 'Highlight 2' }); });
            
            act(() => { globalThis.mockHighlightCompletionFunc();});

            act(() => { globalThis.mockSetChatType('Definition'); });
            act(() => { globalThis.mockSetChatType('Real world analogy'); });
            act(() => { globalThis.mockSetChatType('ELI5'); });

            expect(mockSetTaskCompletion).toHaveBeenCalledWith(true);
        });
    });
});