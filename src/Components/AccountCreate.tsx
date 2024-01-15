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

function AccountCreate() {
    const navigate = useNavigate()
    const [username, setUsername] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loginMsg, setLoginMsg] = useState("");
    const [submitPressed, setSubmitPressed] = useState(false);

    window.resizeTo(450, 800)

    const handleClick = () => {
        setSubmitPressed(true)

        if ((username != "username" || password != "password") && submitPressed == true) {
            setLoginMsg("Username or password is incorrect")
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
                    />
                </label>
            </div>
            <div className='EmailAddress'>
                <label className='TextBoxIndicator'>
                    Email Address
                    <input className='InputField'
                        type="text"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                    />
                </label>
            </div>
            <div className='Password'>
                <label className='TextBoxIndicator'>
                    Password
                    <input className='InputField'
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
            </div>
            <div className='ConfirmPass'>
                <label className='TextBoxIndicator'>
                    Confirm Password
                    <input className='InputField'
                        type="text"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <button className='StartButton' onClick={handleClick}>
                    Submit
                </button>
            </div>
            <p className='ErrorText'>
                {loginMsg}
            </p>
        </>
    )
}

export default AccountCreate;