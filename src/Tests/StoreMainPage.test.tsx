/* 
IMPORTANT
Unit tests do not currently work with ContextIsolation enabled in main.ts
to run unit tests, set ContextIsolation to false and replace any instance of:

        const { ipcRenderer } = window as any;
    
        With

        import { ipcRenderer } from 'electron'

        In each component where it is present

ContextIsolation should be set to true by default for security reasons
Only perform the above steps to run unit tests correctly, until this issue is resolved.
*/

import { render, waitFor, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom/'
import StoreMainPage from '../Components/StoreMainPage';
import { ipcRenderer } from 'electron';

jest.mock('electron', () => ({
    ipcRenderer: {
      invoke: jest.fn(),
      send: jest.fn()
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