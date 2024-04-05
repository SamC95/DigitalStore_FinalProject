import { render, fireEvent, screen } from '@testing-library/react'
import Login from '../Components/Login'
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/';

jest.mock('electron', () => ({
    ipcRenderer: {
        invoke: jest.fn(),
    },
}));

describe('Login Component', () => {
    it('renders the login form', () => {
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

        fireEvent.change(usernameInput, { target: { value: 'testuser' } })

        expect(usernameInput.value).toBe('testuser')
    })

    it('Updates password state on input change', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

        fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

        expect(passwordInput.value).toBe('testpassword')
    })

    it('prevents form submission if username or password is empty', async () => {
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
})