import '../Components/App.tsx'
import { ipcRenderer } from 'electron';
import LoadingBar from './LoadingBar.tsx';
import SearchBar from './SearchBar.tsx';
import { useEffect, useState } from 'react';
import NavBar from './NavBar';
import '../Styles/BasketCheckout.css'

interface Product {
    ProductID: number;
    ProductName: string;
    ProductCover: string;
    ProductPrice: number;
}

function BasketCheckout() {
    const accountId = sessionStorage.getItem('AccountID');
    const [searching, setSearching] = useState(false);
    const [basketData, setBasketData] = useState<Product[]>([])
    const [totalPrice, setTotalPrice] = useState(0)

    useEffect(() => {
        getData()
    }, [accountId])

    const getData = async () => {
        try {
            setSearching(true)
            const data = await ipcRenderer.invoke('getUserBasket', accountId)

            setBasketData(data)
            setSearching(false)
            console.log(basketData)
        }
        catch (error) {
            console.error('Error retrieving basket:', error)
        }
    }

    useEffect(() => {
        if (basketData.length > 0) { // If basket is not empty, reduce is used to calculate total of all price values
            const total = basketData.reduce((accumulator, product) => accumulator + product.ProductPrice, 0)
            setTotalPrice(total)
        }
    }, [basketData]) // Triggers whenever basketData changes

    async function removeProduct(productId: any) {
        await ipcRenderer.invoke('removeFromBasket', accountId, productId) // Removes the specified product from basket

        getData() // Re-calls the database to get an up to date basket list
    }

    return (
        <>
            <div>
                <NavBar />
            </div>

            {searching && <LoadingBar />}

            {!searching && basketData.length === 0 && (
                <>
                    <div>
                        <SearchBar />
                    </div>

                    <h2 className='basketHeader'>Your Basket</h2>

                    <h4 className='emptyBasket'>Basket is currently empty!</h4>
                </>
            )}

            {!searching && basketData.length > 0 && (
                <>
                    <div>
                        <SearchBar />
                    </div>

                    <div className='basketContainer'>
                        <h2 className='basketHeader'>Your Basket</h2>
                        <div className='basketDetails'>
                            <ul key={basketData.length}>
                                {basketData.map((product: any) => (
                                    <li key={product.ProductID} className='basketProductItem'>
                                        <img className='basketProductImage' src={`//images.igdb.com/igdb/image/upload/t_cover_big/${product.ProductCover}.jpg`} alt={`Cover for ${product.ProductName}`} />
                                        <div className='basketProductInformation'>
                                            <p className='basketProductTitle'>{product.ProductName}</p>
                                            <p className='basketProductPrice'>£{product.ProductPrice}</p>
                                            <button className='removeBasketProduct' onClick={() => removeProduct(product.ProductID)}>X</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className='totalBasketPrice'>Total: £{totalPrice.toFixed(2)}</p>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default BasketCheckout;