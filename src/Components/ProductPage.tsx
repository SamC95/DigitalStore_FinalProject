import '../Components/App.tsx'
import { useParams } from 'react-router-dom';
import NavBar from './NavBar.tsx';
import SearchBar from './SearchBar.tsx';
import VerticalNav from './VerticalNav.tsx';
import { useEffect, useState } from 'react';
import '../Styles/ProductPage.css'
import { ipcRenderer } from 'electron';
import LoadingBar from './LoadingBar.tsx';
import imageLoadingFailure from '../assets/image_loading_failure.png'

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
    releaseDate: string;
    cover: string;
    images: string[];
    videos: string[]
    summary: string;
}

const ProductPage: React.FC = () => {
    const { gameId } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searching, setSearching] = useState(false);
    const [productOwned, setProductOwned] = useState(false);
    const [productInfo, setProductInfo] = useState<Game[]>([]);

    const [productMedia, setProductMedia] = useState<ProductMedia[]>([]);

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

                console.log(mediaItems)

                setProductMedia(mediaItems);
            } else {
                // If no product info is available, set placeholder items for all media types
                setProductMedia([
                    { type: 'video', content: imageLoadingFailure },
                    { type: 'image', content: imageLoadingFailure },
                    { type: 'image', content: imageLoadingFailure },
                    { type: 'image', content: imageLoadingFailure }
                ]);
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
        async function retrieveProductData() {
            setSearching(true);

            // Retrieves the initial version of the game object
            const productData = await ipcRenderer.invoke('get-product-by-id', gameId);


            // Creates a new temporary variable used to store the updated version with image urls
            const updatedProductData = await Promise.all(
                productData.map(async (game: { id: any; }) => {
                    const imageData = await ipcRenderer.invoke('get-screenshots', game.id); // Retrieves image urls from API

                    // Maps it to an object of images
                    const images = imageData.map((image: any) => {
                        return { image_id: image.imageId };
                    });

                    console.log(gameId)
                    const videoData = await ipcRenderer.invoke('get-videos', game.id)

                    const videos = videoData.map((video: any) => {
                        return { video_id: video.videoId }
                    })

                    // Return a new Game object which contains the updated details with images
                    return {
                        ...game,
                        images: images,
                        videos: videos
                    };
                })
            );

            console.log(updatedProductData)

            // Overwrite the old Game object with the updated one
            setProductInfo(updatedProductData);
            setSearching(false);
        }

        retrieveProductData();
    }, []);

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

            {!searching && (
                <>
                    <div>
                        <SearchBar />
                    </div>

                    <div className='mainContainer'>
                        <VerticalNav />

                        <div className='productDetails'>
                            <h4>Developers</h4>
                            <p>Cygames</p>
                            <p>Cygames Osaka</p>
                            <p>PlatinumGames Inc</p>

                            <h4>Publishers</h4>
                            <p>Cygames</p>
                            <p>XSEED Games</p>
                            <p>PLAION</p>

                            <h4>Genre</h4>
                            <p>Adventure</p>
                            <p>Role-Playing Game</p>

                            <h4>Release Date</h4>
                            <p>01/02/2024</p>
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
                                            This is not a bug with the program but simply by design of the youtube thumbnail system. */}
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
                                {/* TODO - Add dynamic pricing based on some condition about the product (release year, genre?) */}
                                <div className='productPrice'>
                                    <h3>£49.99</h3>
                                </div>

                                {/*We determine which button is shown and its styling based on whether the current user already owns the product*/}
                                <div className='addToBasket'>
                                    {productOwned === false ? (
                                        <button className='productNotOwned'>Add to Basket</button>
                                    ) : (
                                        <button className='productOwned'>Product Owned</button>
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


// Image Load Failure Icon from: https://www.veryicon.com/icons/education-technology/alibaba-big-data-oneui/image-loading-failed-02.html