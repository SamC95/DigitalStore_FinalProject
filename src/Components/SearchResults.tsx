import NavBar from './NavBar';
import VerticalNav from './VerticalNav';
import SearchBar from './SearchBar';
import '../Styles/SearchResults.css'
import '../Styles/Loading.css'
import { useLocation } from 'react-router-dom';
import LoadingBar from './LoadingBar';
import { useEffect, useState } from 'react';

function SearchResults() {
    const location = useLocation();
    const [hasError, setError] = useState(location.state?.hasError)
    // const navigate = useNavigate();
    const [gameList, setGameList] = useState(location.state?.gameList)
    var [searching, setSearching] = useState(location.state?.searching)

    useEffect(() => {
        const pollInterval = setInterval(() => {
            try {
                const storedGameList = JSON.parse(localStorage.getItem('gameList') || '[]');
                setGameList(storedGameList);

                if (!localStorage.getItem('gameList')) {
                    setSearching(true)
                }

                else if (storedGameList !== '[]') {
                    setSearching(false)
                    setError(false)
                }
            }
            catch (error) {
                console.error("Invalid JSON format: ", error);
                setError(true)
                setSearching(false);
            }
        }, 500); // Adjust the interval as needed

        if (hasError) {
            clearInterval(pollInterval)
        }

    }, []);

    // Two images, one main image and one that displays blurred behind it on mouseover for a mouseover effect
    return (
        <>
            <div>
                <NavBar />
            </div>

            <div>
                <SearchBar />
            </div>

            <div className='searchContainer'>
                <VerticalNav />
                <div className='searchResultsDiv'>
                    <h3 className='customh3'>Results</h3>

                    {searching && <LoadingBar />}

                    {!searching && !hasError && gameList.length == 0 && localStorage.getItem('gameList') && (
                        <h4 className='customh4'>Sorry, we couldn't find what you're looking for!</h4>
                    )}

                    {!searching && hasError && (
                        <h4 className='customh4'>Oops, an error occurred whilst retrieving data!</h4>
                    )}

                    {!searching && !hasError && gameList.length > 0 && (
                        <ul key={gameList.length}>
                            {gameList.map((game: any) => (
                                <li key={game.id}>
                                    <img className='backgroundImage' src={`//images.igdb.com/igdb/image/upload/t_cover_big/${game.image_id}.jpg`} alt={`Cover for ${game.name}`} />
                                    <img className='gameImage' src={`//images.igdb.com/igdb/image/upload/t_cover_big/${game.image_id}.jpg`} alt={`Cover for ${game.name}`} />
                                    <p className='gameTitle'>{game.name}</p>
                                    <p className='gameReleaseDate'>{game.releaseDate ? `Release Date: ${new Intl.DateTimeFormat('default', { year: 'numeric', month: '2-digit', day: '2-digit' })
                                        .format(new Date(game.releaseDate * 1000))}` : "Release Date: TBA"}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

export default SearchResults;
