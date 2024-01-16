import './App.tsx'
import NavBar from './NavBar.tsx'
import { ipcRenderer } from 'electron';
 
function StoreMainPage() {
    ipcRenderer.send('resizeWindow', {width: 1850, height: 1150})
    ipcRenderer.send('centerWindow')
    
    return (
        <div>
            <NavBar/>
        </div>
    );
}

export default StoreMainPage;