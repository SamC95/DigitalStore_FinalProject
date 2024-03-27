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

function Login() {
    const navigate = useNavigate()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginMsg, setLoginMsg] = useState("");

    var validLogin = false;

    const usernameNotEmpty = username.length > 0
    const passwordNotEmpty = password.length > 0

    const handleClick = async (event: { preventDefault: () => void; }) => {
        const validUser = ipcRenderer.invoke('login-details', username, password)

        if (await validUser) {
            validLogin = true
        }
        else {
            validLogin = false
        }

        pageChange(event)
    }

    const pageChange = async (event: { preventDefault: () => void; }) => {
        if ((!usernameNotEmpty || !passwordNotEmpty)) {
            event.preventDefault()
            setLoginMsg("Username or Password field is empty")
        }
        else if ((!validLogin)) {
            event.preventDefault()
            setLoginMsg("Username or password is incorrect")
        }
        else {
            setLoginMsg("")

            const accountId = ipcRenderer.invoke('getAccountId', username)

            /* 
            Retrieves the AccountId to store in session storage. Used to retrieve recently viewed products, 
            check if products are already purchased and retrieve library or for populating the library with purchased products

            SessionStorage would usually not be the optimal way to do this due to developer tools being 
            accessible in browsers, however Electron has the option to prevent user access to developer tools which does help to reduce risk of modification.
            */
            if (accountId) { 
                sessionStorage.setItem('AccountID', await accountId)

                ipcRenderer.invoke('setupRecentlyViewed', await accountId) // Sets up recently viewed row on table for account on first log in
            }

            navigate('/store-main-page')
        }
    }

    return (
        <>
            <ApplicationButtons />
            <button className='BackButtonLogin' onClick={() => navigate('/')}>
                {String.fromCharCode(8592)}
            </button>
            <div>
                <h1 className='LoginTitle'>
                    Welcome Back!
                </h1>
                <p className='TextStyle'>
                    Enter your username and password
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
            <div>
                <button className='StartButton' onClick={(handleClick)}>Submit</button>
            </div>
            <p className='ErrorText'>
                {loginMsg}
            </p>
        </>
    )
}

export default Login;