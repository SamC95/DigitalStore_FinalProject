import './App.tsx'
import NavBar from './NavBar.tsx'
import VerticalNav from './VerticalNav.tsx';
import SearchBar from './SearchBar.tsx';
import '../Styles/FeaturedSection.css'
import { ipcRenderer } from 'electron';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import LoadingBar from './LoadingBar.tsx';
import HorizontalList from './HorizontalList.tsx';
import { Link } from 'react-router-dom';
import BasketButton from './BasketButton.tsx';

/* 
Gets random numbers that are used to define the genres that will appear
on the horizontal lists section of the main page.
We use three separate calls to ensure that each list will only
retrieve from a certain range of numbers, this prevents duplicates between 
the separate horizontal lists, but retains some degree of randomness
*/
const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function assignRandomNumbers(min: number, max: number) {
    return getRandomNumber(min, max)
}

// Interface for a game object
interface Game {
    id: number;
    name: string;
    releaseDate: string;
    cover: string;
    image_id: string;
    artwork_id: string;
}

let featuredCache: Record<string, Game[]> = {};

function StoreMainPage() {
    const hasResizedBefore = localStorage.getItem('hasResized')
    const [searching, setSearching] = useState(false)

    const [featuredLoaded, setFeaturedLoaded] = useState(false);
    const [firstListLoaded, setFirstListLoaded] = useState(false);
    const [secondListLoaded, setSecondListLoaded] = useState(false);

    const [currentDate, setCurrentDate] = useState<number>(0);
    const [monthAgoDate, setMonthAgoDate] = useState<number>(0);

    const [featuredData, setFeaturedData] = useState<Game[]>([])
    const [_imageIds, setImageIds] = useState<string[]>([])

    const [activeButton, setActiveButton] = useState<number>(0);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

    const [firstGenre, setFirstGenre] = useState(-1);
    const [secondGenre, setSecondGenre] = useState(-1);
    const [thirdGenre, setThirdGenre] = useState(-1);

    useEffect(() => {
        // Gets current date and converts it to unix format
        const tempCurrentDate = Math.floor(Date.now() / 1000);
        setCurrentDate(tempCurrentDate)

        // Gets date one month ago and converts it to unix format
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        const tempMonthAgo = Math.floor((oneMonthAgo.getTime() as number) / 1000);
        setMonthAgoDate(tempMonthAgo)
    }, [])

    useEffect(() => {
        if (currentDate !== null && monthAgoDate !== null) {
            getFeaturedProducts()
        }
    }, [currentDate, monthAgoDate])

    async function getFeaturedProducts() {
        try {
            setSearching(true)
            setImageIds([])

            if (Object.keys(featuredCache).length > 0) {
                console.log('Using cached result for featured data')
                const cachedData = Object.values(featuredCache)[0];
                setFeaturedData(cachedData)
                setSearching(false)
            }
            else {
                const data = await ipcRenderer.invoke('get-featured', currentDate, monthAgoDate)

                const featuredProducts = await Promise.all(
                    data.map(async (game: { id: any; }) => {
                        const imageData = await ipcRenderer.invoke('get-screenshots', game.id)

                        if (Array.isArray(imageData) && imageData.length > 0) {
                            const imageIds = imageData.map((image) => image.image_id)
                            setImageIds((prevImageIds) => [...prevImageIds, ...imageIds])

                            return {
                                ...game,
                                image_id: imageData[0].imageId
                            }
                        }
                        else {
                            return game;
                        }
                    })
                )

                featuredCache = {
                    cachedKey: featuredProducts,
                };

                if (featuredProducts.length !== 0) {
                    setFeaturedData(featuredProducts)
                    setSearching(false)
                }

                console.log(featuredProducts)
            }
        }
        catch (error) {
            console.error(error)
        }
    }

    // Resizes the window and centers it using the ipcMain functions in main.ts
    useEffect(() => {
        // This effect will run once when the component is mounted for the first time
        if (hasResizedBefore === "false") {
            ipcRenderer.send('resizeWindow', { width: 1850, height: 1150 });
            ipcRenderer.send('defineMinSize', { width: 1600, height: 900 });
            ipcRenderer.send('centerWindow');

            localStorage.setItem('hasResized', "true")
        }
    }, []);

    useEffect(() => {
        intervalIdRef.current = setInterval(() => {
            // Update activeButton, cycling back to 0 when reaching the last index
            setActiveButton((prevActiveButton) => {
                const nextActiveButton = (prevActiveButton + 1) % featuredData.length;
                return nextActiveButton;
            });
        }, 5000);

        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current)
            }
        };
    }, [featuredData.length]); // Dependency on the length of featuredData

    const handleButtonClick = (index: SetStateAction<number>) => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current) // Clears the interval when a button is clicked
        }
        setActiveButton(index);

        // Restarts interval after clicking a button
        intervalIdRef.current = setInterval(() => {
            setActiveButton((prevActiveButton) => (prevActiveButton + 1) % featuredData.length);
        }, 5000);
    };


    // Assigns a genre for each of the horizontal lists without duplicates
    useEffect(() => {
        if (featuredData.length !== 0) {
            setFirstGenre(assignRandomNumbers(0, 4))
            setSecondGenre(assignRandomNumbers(5, 8))
            setThirdGenre(assignRandomNumbers(9, 12))

            setTimeout(() => {
                setFeaturedLoaded(true)
            }, 2000)
        }
    }, [featuredData])

    useEffect(() => {
        if (featuredLoaded) {
            setTimeout(() => {
                setFirstListLoaded(true) // Delays the loading of the first list until featured section has been loaded
            }, 3000)
        }
    }, [featuredLoaded])

    useEffect(() => {
        if (firstListLoaded) {
            setTimeout(() => {
                setSecondListLoaded(true) // Delays the loading of the second list until after the first list has loaded
            }, 4000)
        }
    }, [firstListLoaded])
    // Delays are done to prevent API overload from too many requests too quickly

    return (
        <>
            <div>
                <NavBar />
            </div>

            {searching && <LoadingBar />}

            {!searching && (
                <>
                    <div>
                        <SearchBar />
                    </div>

                    <div>
                        <BasketButton />
                    </div>

                    <div className='mainContainer'>
                        <VerticalNav />

                        <div className='imageContainer'>
                            <div className='imageWrapper'>
                                {featuredData[activeButton]?.image_id && (
                                    <Link to={`/product-page/${featuredData[activeButton].id}`} style={{ textDecoration: 'none', color: 'white' }}>
                                        <img className='featuredImage' src={`//images.igdb.com/igdb/image/upload/t_original/${decodeURIComponent(featuredData[activeButton]?.image_id)}.jpg`}
                                            alt={`Artwork for ${featuredData[activeButton]?.name}`}
                                        />
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className='titleContainer'>
                            <h2 className='featuredTitle'>{featuredData[activeButton]?.name}</h2>
                        </div>

                        <div className='buttonsContainer'>
                            {featuredData.map((_game, index) => (
                                <button
                                    className={`featuredButton ${activeButton === index ? 'active' : ''}`}
                                    key={index}
                                    onClick={() => {
                                        handleButtonClick(index)
                                        console.log('Clicked Button:', index);
                                    }
                                    }
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        {featuredLoaded && (
                            <>
                                <HorizontalList randomNum={firstGenre} />
                            </>
                        )}

                        {firstListLoaded && (
                            <>
                                <HorizontalList randomNum={secondGenre} />
                            </>
                        )}

                        {secondListLoaded && (
                            <>
                                <HorizontalList randomNum={thirdGenre} />
                            </>
                        )}
                        <br></br>
                    </div>
                </>
            )}
        </>
    );
}

export default StoreMainPage;