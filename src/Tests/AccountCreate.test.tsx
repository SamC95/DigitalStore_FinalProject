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
import AccountCreate from '../Components/AccountCreate'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom/'
import { ipcRenderer } from 'electron';

jest.mock('electron', () => ({
    ipcRenderer: {
      invoke: jest.fn(),
      send: jest.fn(),
    },
  }));

describe('Account Creation Component', () => {
    it('Renders the account creation form', () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        )
    })

    it('Updates username state on input change', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        )

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;

        fireEvent.change(usernameInput, { target: { value: 'testuser' } })

        expect(usernameInput.value).toBe('testuser')
    })

    it('Updates email address state on input change', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        )

        const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;

        act(() => {
            fireEvent.change(emailInput, { target: { value: 'email@' } })
        })

        expect(emailInput.value).toBe('email@')
    })

    it('Updates password state on input change', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        )

        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

        act(() => {
            fireEvent.change(passwordInput, { target: { value: 'password' } })
        })

        expect(passwordInput.value).toBe('password')
    })

    it('Updates password confirmation state on input change', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        )

        const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;

        act(() => {
            fireEvent.change(confirmPasswordInput, { target: { value: 'password' } })
        })

        expect(confirmPasswordInput.value).toBe('password')
    })

    it('Displays error message if username is not long enough', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        )

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;

        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'us' } });
        });

        const submitButton = screen.getByText('Submit')
        fireEvent.click(submitButton)

        await waitFor(() => expect(screen.getByText('Username must be at least 3 characters long')).toBeInTheDocument());
    })

    it('Does not display error message for valid username length', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;

        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'validusername' } })
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => expect(screen.queryByText('Username must be at least 3 characters long')).toBeNull());
    });

    it('Displays error message if email address is not formatted correctly', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        )

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;

        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'validusername' } })
            fireEvent.change(emailInput, { target: { value: 'invalidemail' } })
        }); // Email error will only occur if username is valid as it takes priority on error message

        const submitButton = screen.getByText('Submit');

        fireEvent.click(submitButton)

        await waitFor(() => expect(screen.getByText('Email Address is not a valid format')).toBeInTheDocument())
    })

    it('Does not display error message for valid email format', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;

        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'validusername' } })
            fireEvent.change(emailInput, { target: { value: 'validemail@example.com' } });
        });

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => expect(screen.queryByText('Email Address is not a valid format')).toBeNull());
    });

    it('Displays error message when password is not long enough', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'validusername' } });
            fireEvent.change(emailInput, { target: { value: 'validemail@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'pwd' } });
        }); // Must ensure that other validation checks must have been done before (due to if/else if structure)

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);

        await waitFor(() => expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument())
    })

    it('Displays error message when passwords do not match', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;

        act (() => {
            fireEvent.change(usernameInput, { target: { value: 'validusername' } });
            fireEvent.change(emailInput, { target: { value: 'validemail@example.com'} });
            fireEvent.change(passwordInput, { target: { value: 'password1'} });
            fireEvent.change(confirmPasswordInput, { target: { value: 'password2'} });
        }); // Must ensure that other validation checks must have been done before (due to if/else if structure)

        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton)

        await waitFor(() => expect(screen.getByText('Passwords must match')).toBeInTheDocument())
    })

    it('Calls ipcRenderer.invoke with correct arguments on form submission', async () => {
        render(
            <MemoryRouter>
                <AccountCreate />
            </MemoryRouter>
        )

        const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const confirmPassInput = screen.getByLabelText('Confirm Password') as HTMLInputElement;
    
        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'validusername' } });
            fireEvent.change(emailInput, { target: { value: 'validemail@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'validpassword' } });
            fireEvent.change(confirmPassInput, { target: { value: 'validpassword' } });
        });

        const submitButton = screen.getByText('Submit')
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('check-details', usernameInput.value, emailInput.value)
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('account-create', usernameInput.value, emailInput.value, passwordInput.value)
        });
    })
})