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

    const pageChange = (event: { preventDefault: () => void; }) => {
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

            navigate('/store-main-page')
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