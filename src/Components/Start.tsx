import controllerLogo from '../assets/8002123.png'
import igdbLogo from '../assets/igdb_transparent.png'
import { useNavigate } from 'react-router-dom'
import './App.tsx'
import ApplicationButtons from './ApplicationButtons.tsx'
import '../Styles/StartButton.css'
import '../Styles/ForgotPassButton.css'
import '../Styles/CloseApp.css'
import '../Styles/ControllerLogo.css'
import '../Styles/igdb-logo.css'
import { ipcRenderer } from 'electron'

function Start() {
    localStorage.setItem('hasResized', "false")
    const navigate = useNavigate()

    // Resizes the window using the ipcMain function in main.ts
    // For when the user returns to the page later, such as pressing back from create account or login sections
    ipcRenderer.send('resizeWindow', {width: 450, height: 700})
    ipcRenderer.send('defineMinSize', {width: 450, height: 700})
    ipcRenderer.send('centerWindow')

    /*
    function apiCall() {
        ipcRenderer.invoke('api-test');
    }
    */

    function openLink() {
        ipcRenderer.send('openLink', 'https://www.igdb.com')
    }

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
            <br></br>
            <div>
                <h5>Data from: </h5>
                <button onClick={openLink} className='igdb-logo'>
                    <img src={igdbLogo} className="igdb-logo"/>
                </button>
            </div>
        </>
    )
}
export default Start;