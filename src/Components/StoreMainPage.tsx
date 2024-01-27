import './App.tsx'
import NavBar from './NavBar.tsx'
import VerticalNav from './VerticalNav.tsx';
import SearchBar from './SearchBar.tsx';
import { ipcRenderer } from 'electron';

function StoreMainPage() {
    // Resizes the window and centers it using the ipcMain functions in main.ts
    ipcRenderer.send('resizeWindow', {width: 1850, height: 1150})
    ipcRenderer.send('defineMinSize', {width: 1600, height: 900})
    ipcRenderer.send('centerWindow')
    
    return (
        <>
        <div>
            <NavBar/>
        </div>

        <div>
            <SearchBar/>
        </div>

        <div className='mainContainer'>
            <VerticalNav/>
        </div>
        </>
    );
}

export default StoreMainPage;