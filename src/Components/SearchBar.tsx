import searchIcon from '../assets/4475396.png'
import '../Styles/SearchDiv.css'
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import SearchResults from './SearchResults';
import { useNavigate } from 'react-router-dom';

interface Game {
    id: number;
    name: string;
    releaseDate: string;
    cover: string;
    image_id: string;
}


const SearchBar = () => {
    const navigate = useNavigate()
    const [searchInput, setSearchInput] = useState("")
    const [gameList, setGameList] = useState<Game[]>([]);
    const [searching, setSearching] = useState(false)

    async function performSearch() {
        try {
            setGameList([])
            setSearching(true)
            const data = await ipcRenderer.invoke('product-search', searchInput);
            console.log(data)

            if (data.length === 0) {
                console.log('No data')
            }
            else {
                const updatedGameList = await Promise.all(
                data.map(async (game: { id: any; }) => {
                    const coverData = await ipcRenderer.invoke('get-covers', game.id)
                    console.log(coverData)

                    if (coverData.length > 0) {
                        return {
                            ...game,
                            image_id: coverData[0].imageId,
                        };
                    }
                    else {
                        return game;
                    }
                })
            )

                setGameList(updatedGameList)
            }

        }
        catch (error) {
            console.error(error)
        }
        finally {
            setSearching(false)
        }
    }

    useEffect(() => {
        if (searchInput !== "" && gameList.length > 0) {
            console.log(gameList)
            navigate('/search-results', {state: { gameList }})
        }
    }, [gameList, searchInput, navigate]);

    return (
        <>
            <div className='SearchDiv'>
                <input className='SearchBar'
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <button onClick={performSearch} className='MagnifyingGlass'>
                    <img src={searchIcon} className='MagnifyingGlass' />
                </button>
            </div>

            {searching && <SearchResults/>}
        </>
    )
}

export default SearchBar;