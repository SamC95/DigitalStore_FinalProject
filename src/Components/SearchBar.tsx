import searchIcon from '../assets/4475396.png'
import '../Styles/SearchDiv.css'
import { ipcRenderer } from 'electron';
import { useState } from 'react';

const SearchBar = () => {
    const [searchInput, setSearchInput] = useState("")

    function performSearch() {
        ipcRenderer.invoke('product-search', searchInput);
    }
    
    return (
        <>
        <div className='SearchDiv'>
            <input className='SearchBar'
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            <button onClick={performSearch} className='MagnifyingGlass'>
                <img src={searchIcon} className='MagnifyingGlass'/>
            </button>
        </div>
        </>
    )
}

export default SearchBar;