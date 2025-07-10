import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinalPopUp } from '../FinalPopUp';

let mockSetPopUpDisplay;
let mockSetFeedbackButton;
let user;

const renderPopup = () => {
    return render(
        <FinalPopUp
            setPopUpDisplay={mockSetPopUpDisplay}
            setFeedbackButton={mockSetFeedbackButton}
        />
    );
};

describe('<FinalPopUp />', () => {
    beforeEach(() => {
        mockSetPopUpDisplay = vi.fn();
        mockSetFeedbackButton = vi.fn();
        user = userEvent.setup();
    });

    it('render popup', () => {
        renderPopup();

        expect(screen.getByRole('button', { name: /Complete Later/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Go to Feedback Form/i })).toBeInTheDocument();
    });

    it('complete later gets rid of popup', async () => {
        renderPopup();

        const completeLaterButton = screen.getByRole('button', { name: /Complete Later/i });

        await user.click(completeLaterButton);

        expect(mockSetPopUpDisplay).toHaveBeenCalledTimes(1);
        expect(mockSetPopUpDisplay).toHaveBeenCalledWith(false);
    });
});