import '../Components/App.tsx'
import { useParams } from 'react-router-dom';
import NavBar from './NavBar.tsx';
import SearchBar from './SearchBar.tsx';
import VerticalNav from './VerticalNav.tsx';
import { useEffect, useState } from 'react';
import '../Styles/ProductPage.css'
import LoadingBar from './LoadingBar.tsx';
import BasketButton from './BasketButton.tsx';

const { ipcRenderer } = window as any;

// Interfaces for the Video Player and the MediaRenderer
interface VideoPlayerProps {
    videoId: string;
}

interface MediaRendererProps {
    media: ProductMedia
}

// Defines the types of media that can appear, this is used to determine what link is used to retrieve media
interface ProductMedia {
    type: 'video' | 'image'
    content: string;
}

interface Game {
    id: number;
    name: string;
    releaseDate: number;
    cover: string;
    images: string[];
    videos: string[];
    genres: { genre: string }[];
    companies: string[];
    involvedCompanies: any;
    summary: string;
}

// Retrieves data from here if the user has already looked at this product before (in this session)
const productCache: Record<string, Game[]> = {};

const ProductPage: React.FC = () => {
    const { gameId } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [hasLoaded, setLoaded] = useState(false)
    const [productOwned, setProductOwned] = useState(false);
    const [productInBasket, setProductInBasket] = useState(false);
    const [productReleased, setProductReleased] = useState(false);
    const [productInfo, setProductInfo] = useState<Game[]>([]);

    const [productMedia, setProductMedia] = useState<ProductMedia[]>([]);
    const [productPrice, setProductPrice] = useState<number | null>(null);

    const accountId = sessionStorage.getItem('AccountID')
    const [storeRecentlyViewed, setStoreRecentlyViewed] = useState(false)

    // Function for determining the price of the product based on its release date
    useEffect(() => {
        if (productInfo.length === 0) {
            return; // If product has not been retrieved yet, do nothing
        }

        const currentDate = new Date(); // Get the current date
        const convertedReleaseDate = new Date(productInfo[0].releaseDate * 1000); // Converts the release date from unix format
        let calculatedPrice = 0;

        setProductReleased(convertedReleaseDate && convertedReleaseDate <= currentDate)

        // Checks if the product contains the "Indie" genre, as it is common for these types of games to be of cheaper price
        const isIndie = productInfo[0].genres.some((genreDetails: { genre: string; }) => genreDetails.genre === 'Indie')

        if (!productInfo[0].releaseDate || convertedReleaseDate > currentDate) {
            calculatedPrice = isIndie ? 29.99 : 59.99 // If the release date is undefined or in the future, returns the given value
            setProductPrice(calculatedPrice)
            return;
        }

        // Calculate difference between current year and release date year
        const yearDiff = currentDate.getFullYear() - convertedReleaseDate.getFullYear()

        if (yearDiff < 1) { // Determines the price based on the age of the product and if it is an indie game or not
            calculatedPrice = isIndie ? 29.99 : 59.99
        }
        else if (yearDiff <= 3) {
            calculatedPrice = isIndie ? 22.99 : 44.99
        }
        else if (yearDiff <= 5) {
            calculatedPrice = isIndie ? 15.99 : 29.99
        }
        else {
            calculatedPrice = isIndie ? 9.99 : 19.99
        }

        setProductPrice(calculatedPrice)
    }, [productInfo])


    useEffect(() => {
        if (productInfo.length > 0) {
            const mediaItems: ProductMedia[] = []

            // Checks that the list of videos is not empty
            if (productInfo[0].videos && productInfo[0].videos.length > 0) {
                let index = -1

                // Iterates through the list of videos beginning at the end of the list
                // to retrieve the most recent video
                for (let i = productInfo[0].videos.length - 1; i >= 0; i--) {
                    if (productInfo[0].videos[i]) { // If video exists by this index
                        index = i; // Set index to this value
                        break; // Break out of loop
                    }
                }

                // Use the index from the for loop to determine which video is retrieved
                if (index !== -1) {
                    const recentVideo = productInfo[0].videos[index] as any;
                    mediaItems.push({ type: 'video', content: recentVideo.video_id });
                }

                // Add image items up to a maximum of 3
                for (let i = 0; i < Math.min(3, productInfo[0].images.length); i++) {
                    const image = productInfo[0].images[i] as any;
                    mediaItems.push({ type: 'image', content: image.image_id });
                }

                setProductMedia(mediaItems);
            }
        }
    }, [productInfo]);

    // Ensures that the page is loaded and displayed from the top of the screen
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Defines what link is used based on the media type
    const MediaRenderer: React.FC<MediaRendererProps> = ({ media }) => {
        if (media.type === 'video') {
            return <VideoPlayer videoId={media.content} />;
        }
        else if (media.type === 'image') {
            return <img src={`//images.igdb.com/igdb/image/upload/t_original/${media.content}.jpg`} />;
        }
        else {
            return null;
        }
    }

    // Defines the constraints for the video player, such as its size, title and the link that should be used
    const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId = productMedia[0] }) => (
        <iframe
            title="Embedded Video"
            loading="lazy"
            width="750" // 16:9 width and height aspect ratio
            height="422"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={(e) => console.error("Error loading video: ", e)}
        ></iframe>
    );

    useEffect(() => {
        if (storeRecentlyViewed === true) {
            const resolve = ipcRenderer.invoke('addRecentlyViewed', accountId, productInfo[0].id, productInfo[0].name)
            setStoreRecentlyViewed(false);
            console.log(resolve)
        }
    }, [storeRecentlyViewed])

    useEffect(() => {
        async function retrieveProductData() {
            try {
                setSearching(true);
                setStoreRecentlyViewed(false);

                if (gameId !== undefined) {
                    if (productCache[gameId]) {
                        console.log('Using cached result for: ', gameId)
                        setProductInfo(productCache[gameId])

                        checkProductInBasket()
                        checkProductPurchased()
                        setSearching(false)
                        setStoreRecentlyViewed(true)
                    }
                    else {
                        // Retrieves the initial version of the game object
                        const productData = await ipcRenderer.invoke('get-product-by-id', gameId);

                        // Creates a new temporary variable used to store the updated version with image urls
                        const updatedProductData = await Promise.all(
                            productData.map(async (game: { id: any; genres: any; }) => {
                                const imageData = await ipcRenderer.invoke('get-screenshots', game.id); // Retrieves image urls from API

                                // Maps urls to an object of images
                                const images = imageData.map((image: any) => {
                                    return { image_id: image.imageId };
                                });

                                const videoData = await ipcRenderer.invoke('get-videos', game.id)

                                // Maps urls to an object of videos
                                const videos = videoData.map((video: any) => {
                                    return { video_id: video.videoId }
                                })

                                const genreData = await ipcRenderer.invoke('get-genres', game.genres)

                                const genres = genreData.map((genre: any) => {
                                    return genre;
                                })

                                const companiesData = await ipcRenderer.invoke('get-involved-companies', game.id)

                                const involvedCompanies = companiesData.map((company: any) => {
                                    return company;
                                })

                                // Return a new Game object which contains the updated details with images
                                return {
                                    ...game,
                                    images: images,
                                    videos: videos,
                                    genres: genres,
                                    involvedCompanies: involvedCompanies
                                };
                            })
                        );

                        // Overwrite the old Game object with the updated one
                        setProductInfo(updatedProductData);

                        if (gameId !== undefined) {
                            productCache[gameId] = updatedProductData
                        }

                        checkProductInBasket()
                        checkProductPurchased()
                        setSearching(false);
                        setLoaded(true)
                        setStoreRecentlyViewed(true)
                    }
                }
            }
            catch (error) {
                console.error(error)
                setSearching(false)
                setErrorText('Failed to retrieve product data. Please try again.')
            } // Should prevent hung loading in event that API data is missing or fails to load correctly
    }
        retrieveProductData();
    }, [gameId]);

    // Get the cover for the product, and then add that plus other product details into the basket
    async function addToBasket() {
        const productCover = await ipcRenderer.invoke('get-covers', gameId)

        console.log(productInfo[0].genres)

        await ipcRenderer.invoke('addToBasket', accountId, productInfo[0].id,
            productInfo[0].name, productCover[0]?.imageId, productPrice, JSON.stringify(productInfo[0].genres));

        setProductInBasket(true) // Disables the add to basket button
    }

    // Checks the database to see if there is a match in the basket for this product on this account
    async function checkProductInBasket() {
        const inBasket = await ipcRenderer.invoke('checkBasket', accountId, gameId)

        if (inBasket) {
            setProductInBasket(true)
        }
        else {
            setProductInBasket(false)
        }
    }

    // Checks database to see if there is a match in the purchases database for this product on this account
    async function checkProductPurchased() {
        const alreadyPurchased = await ipcRenderer.invoke('checkAccountPurchases', accountId, gameId)

        if (alreadyPurchased) {
            setProductOwned(true)
        }
        else {
            setProductOwned(false)
        }
    }

    // Updates the index of the main image based on the image pressed in the horizontal list
    function handleImageClick(index: number) {
        setCurrentIndex(index)
    }

    return (
        <>
            <div>
                <NavBar />
            </div>

            {searching && <LoadingBar />}

            {!searching && errorText !== null && (
                <>
                    <h2 className='productTitle'>{errorText}</h2>
                </>
            )}

            {!searching && productMedia.length === 0 && errorText === null && hasLoaded === true && (
                <>
                    <h2 className='noMediaFound'>No Media for this Product</h2>
                </>
            )}

            {!searching && errorText === null && (
                <>
                    <div>
                        <SearchBar />
                    </div>

                    <div>
                        <BasketButton />
                    </div>

                    <div className='mainContainer'>
                        <VerticalNav />

                        <div className='productDetails'>
                            <h4>Developers</h4>
                            {productInfo.length > 0 && (
                                <div>
                                    {productInfo[0].involvedCompanies
                                        .filter((company: { developer: any; }) => company.developer)
                                        .map((company: any, index: any) => (
                                            <p key={index}>{company.company}</p>
                                        ))
                                    }
                                    {productInfo[0].involvedCompanies
                                        .filter((company: { developer: any; }) => company.developer)
                                        .length === 0 && <p>N/A</p>
                                    }
                                </div>
                            )}

                            <h4>Publishers</h4>
                            {productInfo.length > 0 && (
                                <div>
                                    {productInfo[0].involvedCompanies
                                        .filter((company: { publisher: any; }) => company.publisher)
                                        .map((company: any, index: any) => (
                                            <p key={index}>{company.company}</p>
                                        ))
                                    }
                                    {productInfo[0].involvedCompanies
                                        .filter((company: { publisher: any; }) => company.publisher)
                                        .length === 0 && <p>N/A</p>
                                    }
                                </div>
                            )}

                            <h4>Genres</h4>
                            {productInfo.length > 0 && (
                                <div>
                                    {productInfo[0].genres.map((game, index) => (
                                        <p key={index}>{game.genre}</p>
                                    ))}
                                </div>
                            )}

                            <h4>Release Date</h4>
                            <p>{productInfo[0]?.releaseDate ? `${new Intl.DateTimeFormat('default', { year: 'numeric', month: '2-digit', day: '2-digit' })
                                .format(new Date(productInfo[0]?.releaseDate * 1000))}` : "TBA"}</p>
                        </div>

                        <div className='productContainer'>
                            <div className='currentEnlargedMedia'>
                                {productMedia.length > 0 && <MediaRenderer media={productMedia[currentIndex]} />}
                            </div>

                            <div className='productTitle'>
                                {productInfo[0]?.name || "Loading..."}
                            </div>

                            {/* A list of horizontal images that are clicked on to change the main media content
                            If the index is the video index then it will retrieve a thumbnail from youtube for
                            that video, if it's an image then it will be a smaller version of the image that
                            will appear on the main media section when clicked */}
                            <div className='imageButtons'>
                                {productMedia.map((media, index) => (
                                    <button key={index}
                                        className={index === currentIndex ? 'active' : ''}
                                        onClick={() => handleImageClick(index)}
                                    >
                                        {/* Youtube thumbnail image can sometimes return a grey placeholder if there is no high resolution image available
                                            This is not a bug with the program but simply by design of the youtube high-res thumbnail system. Usually occurs for older videos */}
                                        {index === 0 && media.type === 'video' ? (
                                            <img src={`https://img.youtube.com/vi/${media.content}/maxresdefault.jpg`} />
                                        ) : (
                                            <img src={`//images.igdb.com/igdb/image/upload/t_original/${media.content}.jpg`} />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className='productSummary'>
                                <p>{productInfo[0]?.summary || "No Description Available"}</p>
                            </div>

                            <div className='productBasket'>
                                {/* Price based on release date */}
                                <div className='productPrice'>
                                    <h3>{`£${productPrice}` ?? 'N/A'}</h3>
                                </div>

                                {/*We determine which button is shown and its styling based on whether the current user already owns the product or if it's in their basket or not*/}
                                <div className='addToBasket'>
                                    {productReleased ? (
                                        <>
                                            {productOwned === false ? (
                                                <>
                                                    {productInBasket === false ? (
                                                        <button className='productNotOwned' onClick={addToBasket}>Add to Basket</button>
                                                    ) : (
                                                        <button className='productInBasket'>In Basket</button>
                                                    )}
                                                </>
                                            ) : (
                                                <button className='productOwned'>Product Owned</button>
                                            )}
                                        </>
                                    ) : (
                                        <button className='productNotReleased' disabled>Not Released</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default ProductPage;