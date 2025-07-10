import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from '@testing-library/react';
import html2canvas from 'html2canvas';
import { Highlight } from '../Highlight';

vi.mock('html2canvas', () => ({
    default: vi.fn(),
}));

const mockPageElement1 = {
    getBoundingClientRect: () => ({
        top: 50,
        left: 50,
        width: 500,
        height: 700,
    }),
    scrollWidth: 500,
    scrollHeight: 700,
};
const mockPageElement2 = {
    getBoundingClientRect: () => ({
        top: 750,
        left: 50,
        width: 500,
        height: 700,
    }),
    scrollWidth: 500,
    scrollHeight: 700,
};
const mockPageElementsRef = {
    current: [mockPageElement1, mockPageElement2],
};

const mockWordRect = {
    top: 110,
    left: 110,
    width: 50,
    height: 20,
};
const mockRange = {
    setStart: vi.fn(),
    setEnd: vi.fn(),
    getBoundingClientRect: vi.fn(() => mockWordRect),
};
const mockTextNode = {
    nodeType: Node.TEXT_NODE,
    textContent: 'Sample word text',
};
const mockSpanElement = {
    textContent: 'Sample word text',
    firstChild: mockTextNode,
};

let containerRef;
let pageElementsRef;
const mockQuerySelectorAll = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();

    containerRef = {
        current: {
            querySelectorAll: mockQuerySelectorAll,
            scrollLeft: 0,
            scrollTop: 0,
            getBoundingClientRect: () => ({ top: 50, left: 50, width: 800, height: 600 }),
        }
    };
    pageElementsRef = { ...mockPageElementsRef, current: [...mockPageElementsRef.current] };
});

describe('Highlighting', () => {
    it('render', async () => {
        mockQuerySelectorAll.mockReturnValue([mockSpanElement]);
        document.createRange = vi.fn(() => mockRange);
    });

    describe('Highlight Mode', () => {
        it('highlight and extract text on mouse up', async () => {
            vi.useFakeTimers();
        
            const { result } = renderHook(() => Highlight(containerRef, 1, "Highlight", 1, pageElementsRef));
        
            act(() => {
                vi.advanceTimersByTime(501);
                result.current.handleMouseDown({ clientX: 100, clientY: 100 });
                result.current.handleMouseMove({ clientX: 200, clientY: 200 });
            });
        
            await act(async () => {
                 result.current.handleMouseUp();
            });
        
            expect(result.current.highlights.length).toBe(1);
        });

        it("won't drag if box is too small", async () => {
            const { result } = renderHook(() => Highlight(containerRef, 1, "Highlight", 1, pageElementsRef));

            act(() => {
                result.current.handleMouseDown({ clientX: 100, clientY: 100 });
                result.current.handleMouseMove({ clientX: 103, clientY: 103 });
            });

            await act(async () => {
                await result.current.handleMouseUp();
            });

            expect(result.current.currentHighlight).toBeNull();
        });
    });
    
    describe('Snip Mode', () => {
        const scale = 2;

        it('create image snip on mouse up when on page', async () => {
            const { result } = renderHook(() => Highlight(containerRef, 1, "Snip", scale, pageElementsRef));
        
            act(() => {
                result.current.handleMouseDown({ clientX: 100, clientY: 100 });
                result.current.handleMouseMove({ clientX: 201, clientY: 200 });
            });
        
            const mockGetContext = vi.fn(() => ({
                drawImage: vi.fn(),
                scale: vi.fn(),
            }));
        
            const mockCanvasElement = {
                width: 0,
                height: 0,
                getContext: mockGetContext,
                toDataURL: vi.fn(),
            };
        
            const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockCanvasElement);

            html2canvas.mockResolvedValue({
                width: 500 * scale,
                height: 700 * scale
            });
        
            await act(async () => {
                await result.current.handleMouseUp();
            });
            
            expect(result.current.highlights.length).toBe(1);
        
            createElementSpy.mockRestore();
        });

        it('create image snip over multiple pages', async () => {
            const { result } = renderHook(() => Highlight(containerRef, 1, "Snip", scale, pageElementsRef));

            act(() => {
                result.current.handleMouseDown({ clientX: 100, clientY: 100 });
                result.current.handleMouseMove({ clientX: 201, clientY: 700 });
            });

            const canvas1 = { width: 500*scale, height: 700*scale, getContext:()=>({drawImage:vi.fn(), scale:vi.fn()}), toDataURL:()=>''};
            const finalCanvas = { width: 101*scale, height: 600*scale, getContext:()=>({drawImage:vi.fn(), scale:vi.fn()}), toDataURL:()=>'' };

            vi.spyOn(document, 'createElement').mockReturnValueOnce(canvas1).mockReturnValueOnce(finalCanvas);

            await act(async () => {
                await result.current.handleMouseUp();
            });

            expect(result.current.highlights.length).toBe(1);
        });

        it('snip fails when outside page', async () => {
            const { result } = renderHook(() => Highlight(containerRef, 1, "Snip", scale, pageElementsRef));

            act(() => { 
                result.current.handleMouseDown({ clientX: 10, clientY: 10 });
                result.current.handleMouseMove({ clientX: 40, clientY: 40 });
            });

            await act(async () => { await result.current.handleMouseUp(); });

            expect(result.current.currentHighlight).toBeNull();
        });
    });
});