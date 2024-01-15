import controllerLogo from '../assets/8002123.png'
import { useNavigate } from 'react-router-dom'
import './App.tsx'
import ApplicationButtons from './ApplicationButtons.tsx'
import '../Styles/StartButton.css'
import '../Styles/ForgotPassButton.css'
import '../Styles/CloseApp.css'
import '../Styles/ControllerLogo.css'

function Start() {
    const navigate = useNavigate()

    window.resizeTo(450, 600)

    return (
        <>
        <ApplicationButtons/>
            <div>
                <a>
                    <img src={controllerLogo} className="logo" alt="logo" />
                </a>
            </div>
            <h1>Placeholder Title</h1>
            <div className="Login">
                <button className="StartButton" onClick={() => navigate('/login-page')}>
                    Login
                </button>
                <button className="StartButton" onClick={() => navigate('/account-create')}>
                    Create Account
                </button>
                <p>
                    Log in to an existing account or create a new one
                </p>
            </div>
            <button className="ForgotPassButton">
                Forgot Password?
            </button>
        </>
    )
}
export default Start;