import '../Components/App.tsx'
import { ipcRenderer } from 'electron';
import NavBar from './NavBar.tsx';


function SettingsPage() {
    return (
        <>
            <div>
                <NavBar/>
            </div>

            <div>
                <h2>This is the settings page</h2>
            </div>
        </>
    )
}

export default SettingsPage;