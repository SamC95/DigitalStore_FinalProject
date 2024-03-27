import NavBar from './NavBar';
import VerticalNav from './VerticalNav';
import SearchBar from './SearchBar';
import '../Styles/SearchResults.css'
import '../Styles/Loading.css'
import { Link, useLocation } from 'react-router-dom';
import LoadingBar from './LoadingBar';
import { useEffect, useState } from 'react';
import BasketButton from './BasketButton';

function SearchResults() {
    const location = useLocation();
    const [hasError, setError] = useState(location.state?.hasError)
    const [gameList, setGameList] = useState(location.state?.gameList)
    var [searching, setSearching] = useState(location.state?.searching)

    // Once per second, checks the current gameList value stored in localStorage
    useEffect(() => {
        const pollInterval = setInterval(() => {
            try {
                // Gets the localStorage data, parses it back to JSON format and stores it appropriately
                const storedGameList = JSON.parse(localStorage.getItem('gameList') || '[]');
                setGameList(storedGameList);

                // If gameList currently does not exist in localStorage, set searching true to show loading bar
                if (!localStorage.getItem('gameList')) {
                    setSearching(true)
                }

                // If search does not return any results, stops searching and sets error to false. This
                // allows us to show a message on the screen that informs the user that there were no results
                else if (storedGameList !== '[]') {
                    setSearching(false)
                    setError(false)
                }
            }
            catch (error) {
                // If an error occurs in parsing the JSON data from localStorage, catch the error and
                // setError to true, whilst also stopping searching. This allows us to inform the user
                // that an error has occurred.
                console.error("Invalid JSON format: ", error);
                setError(true)
                setSearching(false);
            }
        }, 1000); // Adjust the interval as needed

        if (hasError) {
            clearInterval(pollInterval)
        }

        return () => {
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

            <div>
                <BasketButton />
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
                                <Link to={`/product-page/${game.id}`} style={{ textDecoration: 'none', color: 'white' }}>
                                    <li key={game.id}>
                                        <img className='backgroundImage' src={`//images.igdb.com/igdb/image/upload/t_cover_big/${game.image_id}.jpg`} alt={`Cover for ${game.name}`} />
                                        <img className='gameImage' src={`//images.igdb.com/igdb/image/upload/t_cover_big/${game.image_id}.jpg`} alt={`Cover for ${game.name}`} />
                                        <p className='gameTitle'>{game.name}</p>
                                        <p className='gameReleaseDate'>{game.releaseDate ? `Release Date: ${new Intl.DateTimeFormat('default', { year: 'numeric', month: '2-digit', day: '2-digit' })
                                            .format(new Date(game.releaseDate * 1000))}` : "Release Date: " + " TBA"}</p>
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

export default SearchResults;
