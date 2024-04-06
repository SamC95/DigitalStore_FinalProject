import { render, waitFor, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom/'
import { ipcRenderer } from 'electron';
import StoreMainPage from '../Components/StoreMainPage';

jest.mock('electron', () => ({
    ipcRenderer: {
        invoke: jest.fn(),
        send: jest.fn(),
    },
}));

describe('Store Main Page Component', () => {
    it('Renders the Store Page Component', () => {
        render(
            <MemoryRouter>
                <StoreMainPage />
            </MemoryRouter>
        )
    });

    it('Fetches featured products on mount', async () => {
        render(
            <MemoryRouter>
                <StoreMainPage />
            </MemoryRouter>
        )

        await waitFor(() => expect(ipcRenderer.invoke).toHaveBeenCalledWith('get-featured', expect.any(Number), expect.any(Number))); // Checks if featured data is requested
    });

    it('displays error message on API call failure', async () => {
        ipcRenderer.invoke = jest.fn().mockRejectedValueOnce(new Error());

        render(
            <MemoryRouter>
                <StoreMainPage />
            </MemoryRouter>);

        await waitFor(() => expect(screen.getByText('API Retrieval Error. Please close the application and try again.')).toBeInTheDocument());
    });
})