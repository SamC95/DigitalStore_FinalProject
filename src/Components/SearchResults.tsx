import React, { useEffect } from 'react'
import NavBar from './NavBar';
import VerticalNav from './VerticalNav';
import SearchBar from './SearchBar';
import '../Styles/SearchResults.css'
import { useLocation } from 'react-router-dom';

interface Game {
    id: number;
    name: string;
    releaseDate: Date;
    cover: string;
    image_id: string;
}

const SearchResults = () => {
    const location = useLocation();
    const gameList = location.state?.gameList || [];

    useEffect(() => {
        console.log("Received game list: ", gameList)
    }, [gameList]);

    return (
        <>
        <div>
            <NavBar/>
            <VerticalNav/>
        </div>

        <div>
            <SearchBar/>
        </div>

        <div className='searchResultsDiv'>
            <h3 className='customh3'>Results</h3>
            <ul key={gameList.length}>
                {gameList ? (
                    gameList.map((game: any) => (
                    <li key={game.id}>
                        <img className='gameImage' src={"//images.igdb.com/igdb/image/upload/t_cover_big/" + game.image_id + ".jpg"} alt={'Cover for ' + game.name}/>
                        <p className='gameTitle'>{game.name}</p>
                        <p className='gameReleaseDate'>{game.releaseDate? `Release Date: ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
                                                        .format(new Date(game.releaseDate * 1000))}`: "Release Date: TBA"}</p>
                    </li>
                ))
                ) : (
                    <p>Loading...</p>
                )
            }
            </ul>
        </div>
        </>
    )
}

export default SearchResults;