import { useEffect, useState } from 'react';
import '../Components/App.tsx'
import NavBar from './NavBar.tsx';
import { ipcRenderer } from 'electron';
import LoadingBar from './LoadingBar.tsx';
import '../Styles/ProductLibrary.css'

interface Product { // Sets up the interface for the product with fields used in this component
    ProductID: number;
    ProductName: string;
    ProductCover: string;
    ProductGenres: { genre: string }[];
}

function ProductLibrary() {
    const accountId = sessionStorage.getItem('AccountID')
    const [productData, setProductData] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'DefaultOrder' | 'A-Z' | 'Z-A'>('DefaultOrder');

    useEffect(() => {
        getData();
    }, [accountId]) // Retrieves the data when the account id is retrieved from sessionStorage

    const getData = async () => {
        try {
            setLoading(true)
            const data = await ipcRenderer.invoke('receivePurchases', accountId) // Retrieves purchased products from database for this account

            setProductData(data)
            setLoading(false)
        }
        catch (error) {
            console.error('Error retrieving purchases: ', error)
        }
    }

    const getGenres = (): String[] => {
        const allGenres: String[] = [];

        productData.forEach(product => { // For each product in productData
            product.ProductGenres.forEach(genreObject => { // For each genre of that product
                const genre = genreObject.genre.toString(); // Genre equals that genre object in string format
                if (!allGenres.includes(genre)) { 
                    allGenres.push(genre) // If the genre does not already exist in the list, push it to the list
                }
            })
        })
        allGenres.sort(); // Sort the list of genres alphabetically
        return allGenres;
    }

    const handleGenreToggle = (genre: string) => {
        setSelectedGenres(prevGenres => { // Array of genres used for filtering the products by genre
            if (prevGenres.includes(genre)) {
                return prevGenres.filter(g => g !== genre); // If genre already selected then removes it
            } else {
                return [...prevGenres, genre]; // If genre not selected then adds it
            }
        });
    };

    const sortProducts = (products: Product[]): Product[] => {
        switch (sortBy) { // Sorts the products based on the given criteria
            case 'DefaultOrder':
                return products; // Default order for the products as received from the database
            case 'A-Z':
                return [...products].sort((a, b) => a.ProductName.localeCompare(b.ProductName)); // Alphabetical order from A-Z
            case 'Z-A':
                return [...products].sort((a, b) => b.ProductName.localeCompare(a.ProductName)); // Alphabetical order in reverse from Z-A
            default:
                return products;
        }
    };

    // Checks if selectedGenres length is 0, if it is then adds the entire productData array to filteredProducts
    // If the length is greater than 0, productData is filtered for only the products that match at least one of the current selected genres
    const filteredProducts = selectedGenres.length === 0 ? productData : productData.filter(product =>
        selectedGenres.some(selectedGenre =>
            product.ProductGenres.some(genreObj => genreObj.genre === selectedGenre)
        ) // Iterates over the selected genres and returns true if the current product has a match for that genre
          // If there is at least one match then the product is added to filteredProducts, if no matches then it is not added.
    );

    const sortedProducts = sortProducts(filteredProducts); // Triggers the sortProducts functionality

    return (
        <>
            <div>
                <NavBar />
            </div>

            {loading && <LoadingBar />}

            {!loading && productData.length === 0 && (
                <>
                    <div>
                        <h2>You have not purchased any products yet!</h2>
                    </div>
                </>
            )}

            {!loading && productData.length > 0 && (
                <>
                    <div className='productLibraryContainer'>
                        {sortedProducts.map(product => (
                            <div key={product.ProductID} className='productLibraryCover'>
                                <img src={`//images.igdb.com/igdb/image/upload/t_cover_big/${product.ProductCover}.jpg`} alt={`Cover for ${product.ProductName}`} />
                                <p className='productLibraryName'>{product.ProductName}</p>
                            </div>
                        ))}
                    </div>

                    <div className='productFilterList'>
                        <div>
                            <h4 className='filterListHeader'>Sort By</h4>
                            <button className='filterListText' onClick={() => setSortBy('DefaultOrder')}>Default</button><br />
                            <button className='filterListText' onClick={() => setSortBy('A-Z')}>Alphabetical (A-Z)</button><br />
                            <button className='filterListText' onClick={() => setSortBy('Z-A')}>Alphabetical (Z-A)</button><br />

                            <h4 className='filterListHeader'>Filter By Genre</h4>
                            {getGenres().map((genre) => (
                                <div>
                                    <button 
                                        className={`filterListText ${selectedGenres.includes(genre.toString()) ? 'selected' : ''}`}
                                        onClick={() => handleGenreToggle(genre.toString())}
                                    >
                                        {genre} {selectedGenres.includes(genre.toString()) && ' ✔️'} {/* Displays a tick mark if toggled */}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
export default ProductLibrary;