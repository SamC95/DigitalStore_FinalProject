import './App.tsx'
import NavBar from './NavBar.tsx'
import VerticalNav from './VerticalNav.tsx';
import SearchBar from './SearchBar.tsx';
import { ipcRenderer } from 'electron';
import { useEffect } from 'react';

function StoreMainPage() {
    const hasResizedBefore = localStorage.getItem('hasResized')

    // Resizes the window and centers it using the ipcMain functions in main.ts
    useEffect(() => {
        // This effect will run once when the component is mounted
        if (hasResizedBefore === "false") {
          ipcRenderer.send('resizeWindow', { width: 1850, height: 1150 });
          ipcRenderer.send('defineMinSize', { width: 1600, height: 900 });
          ipcRenderer.send('centerWindow');
          
          localStorage.setItem('hasResized', "true")
        }
      }, []);

    return (
        <>
            <div>
                <NavBar />
            </div>

            <div>
                <SearchBar />
            </div>

            <div className='mainContainer'>
                <VerticalNav />
            </div>
        </>
    );
}

export default StoreMainPage;