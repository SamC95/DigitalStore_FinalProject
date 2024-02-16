import { Link, useNavigate } from 'react-router-dom';
import '../Styles/VerticalNav.css'
import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

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
const genreCache: Record<string, Game[]> = {};
let newReleaseCache: Record<string, Game[]> = {};
let upcomingCache: Record<string, Game[]> = {};

const VerticalNav = () => {
    const navigate = useNavigate()
    const [selectedGenre, setSelectedGenre] = useState("")
    const [searching, setSearching] = useState(false)
    const [gameList, setGameList] = useState<Game[]>([]);
    const [buttonPressed, setButtonPressed] = useState(false);
    const [cacheRetrieved, setCacheRetrieved] = useState(false);
    const [hasError, setError] = useState(false)

    function updateGenre(genre: string) {
        setSelectedGenre(genre)
    }

    function wait(ms: number) {
        const start = Date.now();
        while (Date.now() - start < ms) { }
    }

    async function setDates() {
        // Gets current date and converts it to unix format
        const currentDate = Math.floor(Date.now() / 1000);
        

        // Gets date one month ago and converts it to unix format
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        const monthAgoDate = Math.floor((oneMonthAgo.getTime() as number) / 1000);

        const twoMonthsAhead = new Date();
        twoMonthsAhead.setMonth(twoMonthsAhead.getMonth() + 2)
        const upcomingDate = Math.floor((twoMonthsAhead.getTime() as number) / 1000);

        return [currentDate, monthAgoDate, upcomingDate]
    }

    // Gets cover images for each of the products received in the prior API call.
    async function getCovers(data: { id: any; }[]): Promise<Game[]> {
        const updatedGameList = await Promise.all(
            data.map(async (game: { id: any; }) => {
                const coverData = await ipcRenderer.invoke('get-covers', game.id)
                console.log(coverData)

                if (Array.isArray(coverData) && coverData.length > 0) {
                    return {
                        ...game,
                        image_id: coverData[0].imageId
                    } as Game;
                }
                else {
                    return null
                }
            })
        )

        // Filters the results in the event that any specific games were unable to load
        // important details due to hitting API request limits
        const filteredGameList = updatedGameList.filter((game) => game !== null) as Game[]
        return filteredGameList;
    }

    async function retrieveData() {
        try {
            // Empties the game list and sets searching to true/error to false when the search button is pressed
            localStorage.removeItem('gameList')
            setError(false)
            setSearching(true)

            // If the user has already clicked this genre button, results will be received from the cache
            // rather than re-calling the API and will then be stored in localStorage to be used in SearchResults.tsx
            if (genreCache[selectedGenre]) {
                console.log('Using cached result for: ', selectedGenre)
                setGameList(genreCache[selectedGenre])
                localStorage.setItem('gameList', JSON.stringify(genreCache[selectedGenre]))
                setCacheRetrieved(true);
            }
            else {
                // Performs API call to receive data for specified genre
                const data = await ipcRenderer.invoke('genre-search', selectedGenre, 40)

                // If no results are received, store empty data in localStorage for SearchResults.tsx
                if (data.length === 0) {
                    console.log('No data')
                    localStorage.setItem('gameList', JSON.stringify(data))
                }

                // If results are received, pause for a period of time to allow the API requests
                // to not be overloaded causing 429 errors. Afterwards gets cover images for each
                // of the products received in the prior API call.
                wait(2000)
                const updatedGameList = await getCovers(data);

                // Caches the results of the search so that the data will load rapidly on repeated
                // presses of that genre option during the run of the application.
                genreCache[selectedGenre] = updatedGameList
                setGameList(updatedGameList)

                // Stores list of products into localStorage for SearchResults.tsx
                localStorage.setItem('gameList', JSON.stringify(updatedGameList));
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

    // Retrieves results for the New Releases button, getting products that have released in the past month
    async function getNewReleases() {
        try {
            localStorage.removeItem('gameList');
            setError(false);
            setSearching(true);
            setCacheRetrieved(false);


            if (Object.keys(newReleaseCache).length !== 0) {
                console.log('Using cached results for new releases')
                const cachedData = Object.values(newReleaseCache)[0];
                setGameList(cachedData);
                localStorage.setItem('gameList', JSON.stringify(cachedData))
                setSearching(false);
                setCacheRetrieved(true);
            }
            else {
                const [ currentDate, monthAgoDate ] = await setDates();

                const data = await ipcRenderer.invoke('get-new-releases', currentDate, monthAgoDate)

                // Handles case where there is no data retrieved
                if (data.length === 0) {
                    console.log('No data')
                    localStorage.setItem('gameList', JSON.stringify(data))
                }

                else {
                    wait(3000)

                    const updatedGameList = await getCovers(data)

                    newReleaseCache = {
                        cachedKey: updatedGameList
                    }

                    setGameList(updatedGameList)

                    localStorage.setItem('gameList', JSON.stringify(updatedGameList))
                }
            }
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setSearching(false);
            setButtonPressed(true);
        }
    }

    async function getUpcoming() {
        try {
            localStorage.removeItem('gameList');
            setError(false);
            setSearching(true);
            setCacheRetrieved(false);

            // Retrieves cached results if the search has been performed before
            if (Object.keys(upcomingCache).length !== 0) {
                console.log('Using cached results for upcoming releases');
                const cachedData = Object.values(upcomingCache)[0];
                setGameList(cachedData);
                localStorage.setItem('gameList', JSON.stringify(cachedData));
                setSearching(false);
                setCacheRetrieved(true);
            }
            else {
                // Retrives current date, month ago date is unused in this search
                const [ currentDate, _monthAgoDate, upcomingDate ] = await setDates();

                const data = await ipcRenderer.invoke('get-upcoming', currentDate, upcomingDate)

                if (data.length === 0) {
                    console.log('No data');
                    localStorage.setItem('gameList', JSON.stringify(data))
                }

                else {
                    wait(3000)

                    const updatedGameList = await getCovers(data)

                    upcomingCache = {
                        cachedKey: updatedGameList
                    }

                    setGameList(updatedGameList)

                    localStorage.setItem('gameList', JSON.stringify(updatedGameList))
                }
            }
        }
        catch (error) {
            console.error(error)
        }
        finally {
            setSearching(false);
            setButtonPressed(true);
        }
    }

    // Waits for a change in selectedGenre, if it occurs then it resets the gamelist to empty,
    // pauses briefly to reduce 429 request errors and then calls the retrieveData function
    // After this it will reset selected genre back to empty so that it is ready for the next button click
    useEffect(() => {
        if (selectedGenre !== "") {
            setGameList([])
            wait(750)
            retrieveData()
            setSelectedGenre("")
        }
    }, [selectedGenre]);

    // When the search begins, navigates to SearchResults.tsx to show the loading icon
    // until results are received, then those will be displayed instead
    useEffect(() => {
        if (searching || cacheRetrieved) {
            console.log(gameList)
            navigate('/search-results', { state: { gameList, searching, hasError } })
        }
    }, [gameList, selectedGenre, searching, buttonPressed, navigate]);

    
    // updateGenre number refers to the IGDB id of a specific genre for API calls
    return (
        <>
            <nav className='verticalNav'>
                <h4>Search by Genre</h4>
                <button className='verticalNav_li' onClick={() => updateGenre('31')}>Adventure</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('33')}>Arcade</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('35')}>Card & Board Game</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('4')}>Fighting</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('32')}>Indie</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('8')}>Platform</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('9')}>Puzzle</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('10')}>Racing</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('11')}>Real-time Strategy</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('12')}>Role-Playing Game</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('14')}>Sport</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('13')}>Simulator</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => updateGenre('16')}>Turn-based Strategy</button>
                <br></br>

                <h4>Categories</h4>
                <button className='verticalNav_li' onClick={() => getNewReleases()}>New Releases</button>
                <br></br>
                <button className='verticalNav_li' onClick={() => getUpcoming()}>Upcoming</button>
                <br></br>

                <h4>Recently Viewed</h4>
                <Link className='verticalNav_li' to="/store-main-page"></Link>
                <br></br>
                <Link className='verticalNav_li' to="/store-main-page"></Link>
                <br></br>
                <Link className='verticalNav_li' to="/store-main-page"></Link>
                <br></br>
                <Link className='verticalNav_li' to="/store-main-page"></Link>
                <br></br>
                <Link className='verticalNav_li' to="/store-main-page"></Link>
                <br></br>
            </nav>
        </>
    )
}

export default VerticalNav;