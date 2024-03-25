import '../Components/App.tsx'
import { ipcRenderer } from 'electron';
import LoadingBar from './LoadingBar.tsx';
import SearchBar from './SearchBar.tsx';
import { useEffect, useState } from 'react';
import NavBar from './NavBar';
import '../Styles/BasketCheckout.css'
import { useNavigate } from 'react-router';

interface Product {
    ProductID: number;
    ProductName: string;
    ProductCover: string;
    ProductPrice: number;
    ProductGenres: string[];
}

function BasketCheckout() {
    const accountId = sessionStorage.getItem('AccountID');
    const navigate = useNavigate()
    const [searching, setSearching] = useState(false);
    const [basketData, setBasketData] = useState<Product[]>([])
    const [totalPrice, setTotalPrice] = useState(0)
    const [showPurchaseScreen, setPurchaseScreen] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [cardNum, setCardNum] = useState("")
    const [expiryMonth, setExpiryMonth] = useState("")
    const [expiryYear, setExpiryYear] = useState("")
    const [cardName, setCardName] = useState("")
    const [cardCode, setCardCode] = useState("")
    const [errorString, setErrorString] = useState("")

    useEffect(() => {
        getData()
    }, [accountId])

    const getData = async () => {
        try {
            setSearching(true)
            const data = await ipcRenderer.invoke('getUserBasket', accountId)

            setBasketData(data)
            setSearching(false)
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

    function handleGoBack() { // Returns to the basket and resets all user input on card details
        setPurchaseScreen(false)
        setCardNum("")
        setExpiryMonth("")
        setExpiryYear("")
        setCardName("")
        setCardCode("")
    }

    function handlePurchase() {
        switch (true) {
            case cardNum.length !== 16:
                setErrorString('Card number must be 16-digits long')
                return;

            case expiryMonth.length !== 2 || expiryYear.length !== 2:
                setErrorString('Expiry Date must be in a MM/YY format. E.g., 01/24')
                return;

            case cardName.length < 2:
                setErrorString('Name is too short, must be at least two characters long')
                return;

            case cardCode.length !== 3:
                setErrorString('CVV must be 3-digits long')
                return;
        }

        basketData.forEach(product => {
            ipcRenderer.invoke('addPurchase', accountId, product.ProductID, product.ProductName, product.ProductCover, JSON.stringify(product.ProductGenres), product.ProductPrice);

            ipcRenderer.invoke('removeFromBasket', accountId, product.ProductID)
        })

        setShowConfirmation(true)
    }

    function returnToStore() {
        navigate('/store-main-page')
    }

    function goToLibrary() {
        navigate('/library-page')
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

                    <div className='basketContainer'>
                        <h2 className='basketHeader'>Your Basket</h2>
                        <h4 className='emptyBasket'>Basket is currently empty!</h4>
                    </div>
                </>
            )}

            {!searching && basketData.length > 0 && showPurchaseScreen === false && showConfirmation === false && (
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
                            <button className='checkoutButton' onClick={() => setPurchaseScreen(true)}>Continue to Purchase</button>
                        </div>
                    </div>
                </>
            )}

            {!searching && basketData.length > 0 && showPurchaseScreen === true && showConfirmation === false && (
                <>
                    <div>
                        <SearchBar />
                    </div>

                    <div className='checkoutContainer'>
                        <h2 className='checkoutHeader'>Payment Information</h2>
                        <div>
                            <label className='checkoutText'>
                                Card Number<br />
                                <input className='checkoutField'
                                    type="text"
                                    placeholder='16-digit card number'
                                    value={cardNum}
                                    onChange={(e) => {
                                        const input = e.target.value
                                        const maxLength = 16

                                        const regex = /^[0-9]*$/

                                        if (regex.test(input) && input.length <= maxLength) {
                                            setCardNum(input);
                                        }
                                    }}
                                />
                            </label>

                            <label className='shortCheckoutText'>
                                Expiration<br />
                                <input
                                    className='dateCheckoutField'
                                    type="text"
                                    placeholder='MM'
                                    maxLength={2}
                                    value={expiryMonth}
                                    onChange={(e) => {
                                        const input = e.target.value

                                        // Allows only numerical values starting with 0 and 1 with the appropriate month restrictions
                                        const regex = /^(0[1-9]|1[0-2])?$|^[01]$/;

                                        if (regex.test(input)) {
                                            setExpiryMonth(e.target.value) // Checks the regex condition and ensures max length of 2 digits
                                        }
                                    }}
                                />

                                <span>/</span>

                                <input
                                    className='dateCheckoutField'
                                    type="text"
                                    placeholder='YY'
                                    maxLength={2}
                                    value={expiryYear}
                                    onChange={(e) => setExpiryYear(e.target.value)}
                                />
                            </label>
                        </div>

                        <div>
                            <label className='checkoutText'>
                                Name on Card<br />
                                <input className='checkoutField'
                                    type="text"
                                    placeholder='Name as appears on card'
                                    value={cardName}

                                    onChange={(e) => {
                                        const input = e.target.value;
                                        const regex = /^[a-zA-Z\s]*$/; // Allow letters (both uppercase and lowercase) and spaces
                                        if (regex.test(input)) {
                                            setCardName(input);
                                        }
                                    }}
                                />
                            </label>

                            <label className='shortCheckoutText'>
                                CVV<br />
                                <input className='shortCheckoutField'
                                    type="text"
                                    placeholder='123'
                                    maxLength={3}
                                    value={cardCode}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        const regex = /^[0-9]*$/; // Allows only numbers

                                        if (regex.test(input)) {
                                            setCardCode(e.target.value)
                                        }
                                    }
                                    }
                                />
                            </label>
                        </div>

                        <div>
                            <p className='checkoutTextStyle'>Card details are not checked, stored or charged in this application<br />You do not need to enter any real card details</p>
                        </div>

                        <div>
                            <p className='checkoutCostBreakdown'>Subtotal ({basketData.length} Items): £{(totalPrice * 0.8).toFixed(2)}</p>
                            <p className='checkoutCostBreakdown'>VAT: £{(totalPrice * 0.2).toFixed(2)}</p>
                            <p className='checkoutBasketPrice'>Total: £{totalPrice.toFixed(2)}</p>
                        </div>

                        <div>
                            <button onClick={handleGoBack} className='goBackButton'>{String.fromCharCode(8592)} Go Back</button>

                            <button className='purchaseButton' onClick={handlePurchase}>Purchase</button>
                        </div>

                        <p className='ErrorTextPayment'>{errorString}</p>
                    </div>
                </>
            )}

            {!searching && basketData.length > 0 && showConfirmation === true && (
                <>
                    <div>
                        <SearchBar />
                    </div>

                    <div className='basketContainer'>
                        <h2 className='confirmationHeader'>Product Confirmation</h2>
                        <div className='basketDetails'>
                            <ul key={basketData.length}>
                                {basketData.map((product: any) => (
                                    <li key={product.ProductID} className='confirmationProductItem'>
                                        <img className='confirmationProductImage' src={`//images.igdb.com/igdb/image/upload/t_cover_big/${product.ProductCover}.jpg`} alt={`Cover for ${product.ProductName}`} />
                                        <div className='basketProductInformation'>
                                            <p className='basketProductTitle'>{product.ProductName}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className='confirmationTextStyle'>Products successfully purchased</p>

                            <div>
                                <button className='returnToStoreButton' onClick={returnToStore}>Return to Store</button>
                                <button className='goToLibraryButton' onClick={(goToLibrary)}>Go to Library</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default BasketCheckout;