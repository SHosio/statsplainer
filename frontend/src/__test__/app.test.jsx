import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../Router', () => ({
    default: () => <div data-testid="route">Router</div>
}));

describe('App', () => {
    it('renders app', () => {
        render(<App />);
        expect(screen.getByTestId('route')).toBeInTheDocument();
    });
});
