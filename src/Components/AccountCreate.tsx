import './App.tsx';
import ApplicationButtons from './ApplicationButtons.tsx';
import '../Styles/backButtonLogin.css'
import '../Styles/LoginTitle.css'
import '../Styles/TextBoxIndicator.css'
import '../Styles/TextStyle.css'
import '../Styles/ErrorText.css'
import '../Styles/InputField.css'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ipcRenderer } from 'electron';

function AccountCreate() {
    const navigate = useNavigate()
    const [username, setUsername] = useState("");

    const [emailAddress, setEmailAddress] = useState("");
    const [isEmailValid, setEmailValid] = useState(false)

    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const [loginMsg, setLoginMsg] = useState("");
    var detailsTaken = false;

    // Resizes the window using the ipcMain function in main.ts
    ipcRenderer.send('resizeWindow', {width: 450, height: 800})

    // Ensures that the username must be at least 3 characters long and checks that the field is not empty on submit
    const validUsernameLength = username.length >= 3;
    const usernameNotEmpty = username.length > 0;

    // Ensures that the username cannot include special characters
    const validUsername =  /^[a-zA-Z0-9-]+$/.test(username);

    // Checks that the password is long enough and that the Password and Confirm Password fields match
    const validPassLength = password.length >= 8;
    const passwordMatch = (password == confirmPass);

    // Updates the email address value and then checks that it is of a valid format
    const checkEmailInput = async (event: { target: { value: any }; }) => {
        setEmailAddress(event.target.value)

        const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        setEmailValid(emailFormat.test(event.target.value))
    }

    const handleClick = async (event: { preventDefault: () => void; }) => {
        if (isEmailValid && validUsername) {
            const userExists = await ipcRenderer.invoke('check-details', username, emailAddress)
 
            if (userExists) {
             detailsTaken = true;
            }
            else {
             detailsTaken = false
            }
         }

        pageChange(event)
    }

    const pageChange = (event: { preventDefault: () => void; }) => {
        if ((!validUsernameLength || !usernameNotEmpty)) {
            event.preventDefault()
            setLoginMsg("Username must be at least 3 characters long")
        }
        else if (!validUsername) {
            event.preventDefault()
            setLoginMsg("Username cannot contain numbers or special characters")
        }
        else if (!validPassLength) {
            event.preventDefault()
            setLoginMsg("Password must be at least 8 characters long")
        }
        else if (!passwordMatch) {
            event.preventDefault()
            setLoginMsg("Passwords must match")
        }
        else if (!isEmailValid) {
            event.preventDefault()
            setLoginMsg("Email Address is not a valid format")
        }
         else if (detailsTaken) {
             event.preventDefault()
             setLoginMsg("This username or email address is already taken")
        }
        else {
            setLoginMsg("")
            
            ipcRenderer.invoke("account-create", username, emailAddress, password)

            navigate('/')
        }
    }

    return (
        <>
        <ApplicationButtons/>
            <button className='BackButtonLogin' onClick={() => navigate('/')}>
                {String.fromCharCode(8592)}
            </button>
            <div>
                <h1 className='LoginTitle'>
                    Create an account!
                </h1>
                <p className='TextStyle'>
                    Enter the following details
                </p>
            </div>
            <div className='UserName'>
                <label className='TextBoxIndicator'>
                    Username
                    <input className='InputField'
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleClick(e)
                            }
                        }}
                    />
                </label>
            </div>
            <div className='EmailAddress'>
                <label className='TextBoxIndicator'>
                    Email Address
                    <input className='InputField'
                        type="email"
                        value={emailAddress}
                        onChange={checkEmailInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleClick(e)
                            }
                        }}
                    />
                </label>
            </div>
            <div className='Password'>
                <label className='TextBoxIndicator'>
                    Password
                    <input className='InputField'
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleClick(e)
                            }
                        }}
                    />
                </label>
            </div>
            <div className='ConfirmPass'>
                <label className='TextBoxIndicator'>
                    Confirm Password
                    <input className='InputField'
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleClick(e)
                            }
                        }}
                    />
                </label>
            </div>
            <div>
                <button className='StartButton' onClick={handleClick}>Submit</button>
            </div>
            <p className='ErrorText'>
                {loginMsg}
            </p>
        </>
    )
}

export default AccountCreate;