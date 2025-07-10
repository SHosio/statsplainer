import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCallPost, apiCallGet, apiCallPostText } from '../ApiCalls';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockPdfFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });

beforeEach(() => {
    mockFetch.mockClear();
});

describe('API calls', () => {
    describe('apiCallPost', () => {
        it('accept case', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

            await expect(apiCallPost('data', mockPdfFile)).resolves;
        });

        it('reject case', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false });
            await expect(apiCallPost('data', mockPdfFile)).rejects.toMatch('POST Promise reject error');
        });
    });

    describe('apiCallGet', () => {
        const queryString = 'data';

        it('accept case', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

             await expect(apiCallGet('data', queryString)).resolves;
        });

        it('reject case', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false });

            await expect(apiCallGet('data', queryString)).rejects.toMatch('GET Promise reject error');
        });
    });

    describe('apiCallPostText', () => {
        const requestBody = { name: 'data', value: 1 };

        it('accept case', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

            await expect(apiCallPostText('data', requestBody)).resolves;
        });

        it('reject case', async () => {
            mockFetch.mockResolvedValueOnce({ ok: false });

            await expect(apiCallPostText('data', requestBody)).rejects.toMatch('POST Promise reject error');
        });
    });
});