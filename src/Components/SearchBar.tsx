import { ipcRenderer } from 'electron';
import searchIcon from '../assets/4475396.png'
import '../Styles/SearchDiv.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Interface for a game object
interface Game {
    id: number;
    name: string;
    releaseDate: string;
    cover: string;
    image_id: string;
}

// Cache that is used to more easily retrieve data for
// searches that have already been performed, without the need recalling the API
const searchCache: Record<string, Game[]> = {};

const SearchBar = () => {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("")
    const [gameList, setGameList] = useState<Game[]>([]);
    const [searching, setSearching] = useState(false)
    const [buttonPressed, setButtonPressed] = useState(false)
    const [hasError, setError] = useState(false)

    // Wait function used for implementing delays in the search process so that the
    // API is not reaching a request limit as much as possible (429 error)
    function wait(ms: number) {
        const start = Date.now();
        while (Date.now() - start < ms) { }
    }

    async function performSearch() {
        try {
            // Empties the game list and sets searching to true when the search button is pressed
            localStorage.removeItem('gameList')
            setError(false)
            setSearching(true)

            // If this particular search has already been performed before, use the cache
            if (searchCache[searchInput]) {
                console.log('Using cached result for: ', searchInput)
                setGameList(searchCache[searchInput])
                localStorage.setItem('gameList', JSON.stringify(searchCache[searchInput]))
            }
            else {
                // Starts the API call process in main.ts
                const data = await ipcRenderer.invoke('product-search', searchInput);

                // If the call returns no results, do nothing
                if (data.length === 0) {
                    console.log('No data')
                    setGameList(data)
                    localStorage.setItem('gameList', JSON.stringify(data))
                }

                // Implements a wait period so that API request limits are avoided as 
                // much as possible
                else {
                    wait(3000)

                    // Retrieves the cover images for the games retrieved in data and maps
                    // them accordingly
                    const updatedGameList = await Promise.all(
                        data.map(async (game: { id: any; }) => {
                            const coverData = await ipcRenderer.invoke('get-covers', game.id)

                            if (Array.isArray(coverData) && coverData.length > 0) {
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

                    // Adds final search results to cache, and updates the game list accordingly
                    searchCache[searchInput] = updatedGameList
                    setGameList(updatedGameList)

                    localStorage.setItem('gameList', JSON.stringify(updatedGameList));
                }
            }
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setSearching(false)
            setButtonPressed(true)
        }
    }

    // When user starts search, navigate to SearchResults.tsx to show loading bar
    // and results when they have loaded.
    useEffect(() => {
        if (searching) {
            console.log(gameList)
            navigate('/search-results', {state: { gameList, searching, hasError }})
        }
    }, [gameList, searchInput, searching, buttonPressed, navigate]);

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

        </>
    )
}

export default SearchBar;