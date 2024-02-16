import './App.tsx'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { ipcRenderer } from 'electron';
import { useState, useEffect } from 'react';
import LoadingBar from './LoadingBar.tsx';
import '../Styles/HorizontalList.css'
import '../Styles/igdb-logo.css'

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

    useEffect(() => {
        async function retrieveData() {
            setSearching(true)
            const data = await ipcRenderer.invoke('genre-search', GenreIDs[listNumber], 12)

            console.log(data)

            const updatedList = await getCovers(data);

            setDataList(updatedList)
            setSearching(false)
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
                                    {<img className='horizontalListImage' src={`//images.igdb.com/igdb/image/upload/t_cover_big/${game.image_id}.jpg`} alt={`Cover for ${game.name}`} />}
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