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

import { render, fireEvent, screen, act, waitFor } from '@testing-library/react'
import Login from '../Components/Login'
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/';
import { ipcRenderer } from 'electron';

jest.mock('electron', () => ({
    ipcRenderer: {
      invoke: jest.fn(),
    },
  }));

describe('Login Component', () => {
    it('Renders the login form', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )
    })

    it('Updates username state on input change', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )
        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;

        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        });

        expect(usernameInput.value).toBe('testuser')
    })

    it('Updates password state on input change', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

        act(() => {
            fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
        });

        expect(passwordInput.value).toBe('testpassword')
    })

    it('Prevents form submission if username or password is empty', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )
        const submitButton = screen.getByText('Submit');

        fireEvent.click(submitButton);

        await screen.findByText(/(Username|Password) or Password field is empty/);

        // Assert that the error message is displayed when the form is submitted with empty fields
        expect(screen.getByText(/(Username|Password) or Password field is empty/)).toBeInTheDocument();
    });

    it('Calls ipcRender.invoke with correct arguments on form submission', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByText('Submit');

        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'validUser' } });
            fireEvent.change(passwordInput, { target: { value: 'validPassword' } });
        });

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('login-details', usernameInput.value, passwordInput.value)
        })
    })

    it('Prevents form submission if login details are incorrect', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByText('Submit');

        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'invalidUser' } });
            fireEvent.change(passwordInput, { target: { value: 'invalidPassword' } });
        });

        fireEvent.click(submitButton);

        // Ensure that the error message is displayed when the form is submitted with incorrect login details
        await screen.findByText(/Username or Password is incorrect/);

        expect(screen.getByText(/Username or Password is incorrect/)).toBeInTheDocument();
    });
})