import '../Components/App.tsx'
import { ipcRenderer } from 'electron';
import NavBar from './NavBar.tsx';
import '../Styles/SettingsPage.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SettingsPage() {
    const [showModal, setShowModal] = useState(false);
    const accountId = sessionStorage.getItem('AccountID')
    const navigate = useNavigate();

    function confirmDelete() {
        setShowModal(true);
    }

    function handleConfirm() {
        setShowModal(false);
    }

    function handleCancel() {
        setShowModal(false);
    }

    function handleSignOut() {
        // Removes account id from sessionStorage
        sessionStorage.removeItem('AccountID')

        navigate('/') // Navigates to initial app state
        ipcRenderer.send('resizeWindow',  { width: 450, height: 600 })
        ipcRenderer.send('defineMinSize', { width: 450, height: 600 })
        ipcRenderer.send('centerWindow'); // Repositions window

        localStorage.setItem('hasResized', 'false') // Ensures window will resize on next log in
    }

    return (
        <>
            <div>
                <NavBar />
            </div>

            <div className='signOut'>
                <h3 className='settingsHeader'>Sign out of account</h3>

                <div>
                    <p className='settingsText'>Click here to sign out of your account</p>

                    <button className='settingsButton' onClick={handleSignOut}>Sign out</button>
                </div>
            </div>

            <div className='deleteAccount'>
                <h3 className='settingsHeader'>Delete account</h3>

                <div>
                <p className='deleteAccountText'>This will remove all account information and product purchases permanently</p>
                    <p className='deleteAccountText'>Click here to delete account</p>

                    <button className='deleteAccountButton' onClick={(confirmDelete)}>Delete Account</button>
                </div>
            </div>

            {showModal && (
                <div className='modalOverlay'>
                    <div className='modalContent'>
                        <p className='modalText'>Are you sure you want to delete your account?<br/>This is non-reversible!</p>
                        <button className='modalButton' onClick={handleConfirm}>Yes</button>
                        <button className='modalButton' onClick={handleCancel}>No</button>
                    </div>
                </div>
            )}
        </>
    )
}

export default SettingsPage;