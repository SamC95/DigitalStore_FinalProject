import './App.tsx'
import NavBar from './NavBar.tsx'
import VerticalNav from './VerticalNav.tsx';
import '../Styles/SearchBar.css'
import searchIcon from '../assets/4475396.png'
import '../Styles/MagnifyingGlass.css'
import { ipcRenderer } from 'electron';
import { useState } from 'react';

function StoreMainPage() {
    // Resizes the window and centers it using the ipcMain functions in main.ts
    ipcRenderer.send('resizeWindow', {width: 1850, height: 1150})
    ipcRenderer.send('defineMinSize', {width: 1600, height: 900})
    ipcRenderer.send('centerWindow')

    const [searchInput, setSearchInput] = useState("")
    
    return (
        <>
        <div>
            <NavBar/>
            <VerticalNav/>
        </div>

        <div>
            <input className='SearchBar'
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className='MagnifyingGlass'>
                <img src={searchIcon} className='MagnifyingGlass'/>
            </button>
        </div>
        </>
    );
}

export default StoreMainPage;