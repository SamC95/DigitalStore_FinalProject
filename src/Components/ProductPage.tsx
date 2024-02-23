import '../Components/App.tsx'
import { useParams } from 'react-router-dom';
import NavBar from './NavBar.tsx';
import SearchBar from './SearchBar.tsx';
import VerticalNav from './VerticalNav.tsx';
import { useState } from 'react';
import '../Styles/ProductPage.css'

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

const ProductPage: React.FC = () => {
    const { gameId } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [productOwned, setProductOwned] = useState(false);
    const [productMedia] = useState<ProductMedia[]>([
        { type: 'video', content: 'Hg2wKVsGTL8' },
        { type: 'image', content: 'zrjemcp7ittnbgwki0ao' }
    ])

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
            width="750" // 16:9 width and height aspect ratio
            height="422"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={(e) => console.error("Error loading video: ", e)}
        ></iframe>
    );

    // Updates the index of the main image based on the image pressed in the horizontal list
    function handleImageClick(index: number) {
        setCurrentIndex(index)
    }

    return (
        <>
            <div>
                <NavBar />
            </div>

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
                        <MediaRenderer media={productMedia[currentIndex]} />
                    </div>

                    <div className='productTitle'>
                        Granblue Fantasy: Relink
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
                                {index === 0 ? ( 
                                    <img src={`https://img.youtube.com/vi/${media.content}/maxresdefault.jpg`} />
                                ) : (
                                    <img src={`//images.igdb.com/igdb/image/upload/t_original/${media.content}.jpg`} />
                                )}
                            </button>
                        ))}
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
    )
}

export default ProductPage;