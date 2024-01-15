import './App.tsx';
import ApplicationButtons from './ApplicationButtons.tsx';
import '../Styles/backButtonLogin.css'
import '../Styles/LoginTitle.css'
import '../Styles/TextBoxIndicator.css'
import '../Styles/TextStyle.css'
import '../Styles/ErrorText.css'
import '../Styles/InputField.css'
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginMsg, setLoginMsg] = useState("");
    const [submitPressed, setSubmitPressed] = useState(false);
    
    const handleClick = () => {
        setSubmitPressed(true)
    }

    const pageChange = () => {
        if (username != "username" && password != "password" && submitPressed == true) {
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
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>
        </div>
        <div>
            <Link onClick={pageChange} to={{ pathname: '/store-main-page'}}>
                <button className='StartButton' onClick={(handleClick)}>Submit</button>
            </Link>
        </div>
        <p className='ErrorText'>
            {loginMsg}
        </p>
        </>
    )
}

export default Login;