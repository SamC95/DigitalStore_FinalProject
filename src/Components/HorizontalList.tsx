import './App.tsx'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { useState, useEffect } from 'react';
import LoadingBar from './LoadingBar.tsx';
import '../Styles/HorizontalList.css'
import '../Styles/igdb-logo.css'
import { Link } from 'react-router-dom';

const { ipcRenderer } = window as any;

interface HorizontalListProps {
    randomNum: number;
}

// Interface for a game object
interface Game {
    id: number;
    name: string;
    releaseDate: string;
    cover: string;
    image_id: string;
}

const horizontalListCache: Record<string, Game[]> = {};

// The appropriate IDs and names of each genre, which are used based on the list number variable
const GenreIDs = [4, 8, 9, 10, 11, 12, 13, 14, 16, 31, 32, 33, 35]
const GenreNames = ['Fighting', 'Platform', 'Puzzle', 'Racing', 'Real-time Strategy',
    'Role-playing', 'Simulator', 'Sports', 'Turn-based Strategy',
    'Adventure', 'Indie', 'Arcade', 'Card & Board']

function HorizontalList({ randomNum }: HorizontalListProps) {
    const [dataList, setDataList] = useState<Game[]>([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [searching, setSearching] = useState(false)
    const listNumber = randomNum
    const maxVisibleItems = 4; // Maximum number of items to display at once

    // Used to allow the user to press the right or left arrows to move back and forth in the horizontal list
    const handleScroll = (scrollOffset: number) => {
        let newScrollPosition = scrollPosition + scrollOffset;

        newScrollPosition = Math.max(0, Math.min(newScrollPosition, dataList.length - maxVisibleItems));

        setScrollPosition(newScrollPosition);
    };

    // Gets cover images for each of the products received in the API call.
    async function getCovers(data: { id: any; }[]): Promise<Game[]> {
        const updatedGameList = await Promise.all(
            data.map(async (game: { id: any; }) => {
                const coverData = await ipcRenderer.invoke('get-covers', game.id)

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

    // If the list number changes, starts retrieving results for a genre based on the list number
    useEffect(() => {
        async function retrieveData() {
            setSearching(true)
            if (horizontalListCache[listNumber]) {
                setDataList(horizontalListCache[listNumber])
                setSearching(false)
            }
            else {
                const data = await ipcRenderer.invoke('genre-search', GenreIDs[listNumber], 12)

                const updatedList = await getCovers(data);

                horizontalListCache[listNumber] = updatedList
                setDataList(updatedList)
                setSearching(false)
            }
        }
        retrieveData()
    }, [listNumber])

    return (
        <>
            {searching && <LoadingBar />}

            {!searching && (
                <div className='horizontalListContainer'>
                    <div className='horizontalListGenre'>
                        <h2>{GenreNames[listNumber]} Games</h2>
                    </div>
                    <div className='horizontalListWrapper'>
                        <div className='horizontalListButton'>
                            <MdChevronLeft onClick={() => handleScroll(-1)} size={40} />
                        </div>
                        <div id='horizontalList'>
                            {dataList.map((game, index) => {
                                const isVisible = index >= scrollPosition && index < scrollPosition + maxVisibleItems;
                                return (
                                    isVisible && // Check if item is within visible range
                                    <div key={index} className='horizontalListItem'>
                                        <Link to={`/product-page/${game.id}`} style={{ textDecoration: 'none', color: 'white' }}>
                                            {<img className='horizontalListImage' src={`//images.igdb.com/igdb/image/upload/t_cover_big/${game.image_id}.jpg`} alt={`Cover for ${game.name}`} />}
                                        </Link>
                                        <p className='horizontalListName'>{game.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className='horizontalListButton'>
                            <MdChevronRight onClick={() => handleScroll(1)} size={40} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HorizontalList;