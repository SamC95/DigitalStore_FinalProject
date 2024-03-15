import '../Components/App.tsx'
import { ipcRenderer } from 'electron';
import NavBar from './NavBar.tsx';
import '../Styles/SettingsPage.css'
import { useState } from 'react';

function SettingsPage() {
    const [showModal, setShowModal] = useState(false);

    function confirmDelete() {
        setShowModal(true);
    }

    function handleConfirm() {
        // Perform account deletion logic here
        setShowModal(false);
    }

    function handleCancel() {
        setShowModal(false);
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

                    <button className='settingsButton'>Sign out</button>
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