import { Link, useNavigate } from 'react-router-dom';
import '../Styles/VerticalNav.css'
import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

interface Game {
    id: number;
    name: string;
    releaseDate: string;
    cover: string;
    image_id: string;
}

const VerticalNav = () => {
    const navigate = useNavigate()
    const [selectedGenre, setSelectedGenre] = useState("")
    const [gameList, setGameList] = useState<Game[]>([]);
    const [_searching, setSearching] = useState(false)

    function updateGenre(genre: string) {
        setSelectedGenre(genre)
    }

    function wait(ms: number) {
       const start = Date.now();
       while (Date.now() - start < ms) {}
    }

    async function retrieveData() {
        try {  
            setSearching(true)

            const data = await ipcRenderer.invoke('genre-search', selectedGenre)
            console.log(data)

            if (data.length === 0) {
                console.log('No data')
            }
            else {
                const updatedGameList = await Promise.all(
                    data.map(async (game: { id: any; }) => {
                        const coverData = await ipcRenderer.invoke('get-covers', game.id)
                        console.log(coverData)

                        if (Array.isArray(coverData) && coverData.length > 0) {
                            return {
                                ...game,
                                image_id: coverData[0].imageId
                            };
                        }
                        else {
                            return null
                        }
                    })
                )

                const filteredGameList = updatedGameList.filter((game) => game !== null)

                setGameList(filteredGameList)
            }
        }
        catch (error) {
            console.error(error)

            return null
        }
        finally {
            setSearching(false)
        }
    }

    // Waits for a change in selectedGenre, if it occurs then it resets the gamelist to empty,
    // pauses briefly to minimise risk of 429 request errors and then calls the retrieveData function
    // After this it will reset selected genre back to empty so that it is ready for the next button click
    useEffect(() => {
        if (selectedGenre !== "") {
            setGameList([])
            wait(750)
            retrieveData()
            setSelectedGenre("")
        }
    }, [selectedGenre]);

    useEffect(() => {
        if (selectedGenre !== "" && gameList.length > 0) {
            console.log(gameList)
            navigate('/search-results', { state: { gameList } })
        }
    }, [gameList, selectedGenre, navigate]);

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
                <button className='verticalNav_li' onClick={() => updateGenre('16')}>Turn-based strategy</button>
                <br></br>

                <h4>Categories</h4>
                <Link className='verticalNav_li' to="/store-main-page">New Releases</Link>
                <br></br>
                <Link className='verticalNav_li' to="/store-main-page">Upcoming</Link>
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