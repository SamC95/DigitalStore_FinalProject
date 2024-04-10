import '../Components/App.tsx'
import { ipcRenderer } from 'electron';
import NavBar from './NavBar.tsx';
import igdbLogo from '../assets/igdb_transparent.png'
import icons8logo from '../assets/icons8-logo-4D126FBA84-seeklogo.com.png'
import flatIconLogo from '../assets/Flaticon.png'
import '../Styles/SettingsPage.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product { // Sets up the interface for the product with fields used in this component
    ProductID: number;
    ProductName: string;
    CostOfPurchase: number;
}

function SettingsPage() {
    const accountId = sessionStorage.getItem('AccountID')
    const [selectedProduct, setSelectedProduct] = useState("")
    const [refundModalMessage, setRefundModalMessage] = useState("")
    const [showRefundModal, setShowRefundModal] = useState(false)
    const [productData, setProductData] = useState<Product[]>([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getData();
    }, [accountId, showRefundModal]) // Retrieves the data when the account id is retrieved from sessionStorage

    const getData = async () => {
        try {
            const data = await ipcRenderer.invoke('receivePurchases', accountId) // Retrieves purchased products from database for this account

            setProductData(data)
        }
        catch (error) {
            console.error('Error retrieving purchases: ', error)
        }
    }

    const handleRefund = async () => {
        if (selectedProduct === "") { // selectedProduct changes to a product id if one is selected, if not then it is an empty string
            setShowRefundModal(true) 
            setRefundModalMessage("Please select a product to refund.");
        } else {
            const selectedProductName = productData.find(product => product.ProductID === parseInt(selectedProduct, 10))?.ProductName
            if (selectedProductName) { // Retrieves the product name based on the ID number, if it has found a value then it removes the product
                await ipcRenderer.invoke('removeProduct', accountId, selectedProduct)
                setShowRefundModal(true)
                setRefundModalMessage(`${selectedProductName} refunded successfully.`);
                setSelectedProduct("")
            }
            else { // If no match is found for that ID with a product name then it will error, this shouldn't trigger in normal use.
                setShowRefundModal(true)
                setRefundModalMessage(`Error retrieving product with ID ${selectedProduct}`)
                setSelectedProduct("")
            }
        }
    };

    function confirmDelete() {
        setShowModal(true);
    }

    function handleConfirm() {
        setShowModal(false);

        deleteAccount();
    }

    function handleRefundModal() {
        setShowRefundModal(false)
        setRefundModalMessage("")
    }

    function handleCancel() {
        setShowModal(false);
    }

    function handleSignOut() {
        // Removes account id from sessionStorage
        sessionStorage.removeItem('AccountID')

        navigate('/') // Navigates to initial app state
        ipcRenderer.send('resizeWindow', { width: 450, height: 600 })
        ipcRenderer.send('defineMinSize', { width: 450, height: 600 })
        ipcRenderer.send('centerWindow'); // Repositions window

        localStorage.setItem('hasResized', 'false') // Ensures window will resize on next log in
    }

    function deleteAccount() {
        ipcRenderer.invoke('deleteAccount', accountId)

        handleSignOut()
    }

    function openLink(productLink: any) {
        ipcRenderer.send('openLink', productLink)
    }


    return (
        <>
            <div>
                <NavBar />
            </div>

            <div className='settingsContainer'>
                <h2 className='topHeader'>Settings</h2>

                <div className='signOut'>
                    <h3 className='settingsHeader'>Sign out of account</h3>

                    <div>
                        <p className='settingsText'>Click here to sign out of your account</p>

                        <button className='settingsButton' onClick={handleSignOut}>Sign out</button>
                    </div>
                </div>

                <div className='refundProduct'>
                    <h3 className='settingsHeader'>Refund Product</h3>

                    <div>
                        <p className='refundProductText'>Choose a product to refund and remove from your purchased products</p>
                        <select className='refundProductDropdown' value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                            <option value="">-- Select a Product to Refund --</option>
                            {productData.map(product => (
                                <option key={product.ProductID} value={product.ProductID}>
                                    {product.ProductName} -- £{product.CostOfPurchase}
                                </option>
                            ))}
                        </select>

                        <button className='refundProductButton' onClick={(handleRefund)}>Refund Product</button>
                    </div>
                </div>

                <div className='deleteAccount'>
                    <h3 className='settingsHeader'>Delete account</h3>

                    <div>
                        <p className='deleteAccountText'>This will remove all account information and product purchases permanently</p>
                        <p className='deleteAccountText'>Click here to delete your account permanently.</p>

                        <button className='deleteAccountButton' onClick={(confirmDelete)}>Delete Account</button>
                    </div>
                </div>

                <div className='appCredits'>
                    <h3 className='settingsHeader'>Credits</h3>
                    <div className='creditsContent'>
                        <p className='creditsText'>Product data provided by: </p>
                        <button onClick={() => openLink("https://www.igdb.com")} className='igdb-logo'>
                            <img src={igdbLogo} className='igdb-logo' />
                        </button>
                    </div>

                    <div className='creditsContent'>
                        <p className='creditsText'>Search Magnifying Glass Icon Provided By: </p>
                        <button onClick={() => openLink("https://icons8.com/icons")} className='icons8-logo'>
                            <img src={icons8logo} className='icons8-logo' />
                        </button>
                    </div>

                    <div className='creditsContent'>
                        <p className='creditsText'>Controller Logo Provided By:  </p>
                        <button onClick={() => openLink("https://www.flaticon.com/")} className='flatIcon-logo'>
                            <img src={flatIconLogo} className='flatIcon-logo' />
                        </button>
                    </div>

                    <div className='creditsContent'>
                        <p className='creditsText'>All products retrieved from IGDB are the property of their respective copyright holders.</p>
                    </div>
                </div>

                {/* Modal for showing delete account warning */}
                {showModal && (
                    <div className='modalOverlay'>
                        <div className='modalContent'>
                            <p className='modalText'>Are you sure you want to delete your account?<br />This is non-reversible!</p>
                            <button className='modalButton' onClick={handleConfirm}>Yes</button>
                            <button className='modalButton' onClick={handleCancel}>No</button>
                        </div>
                    </div>
                )}

                {/* Modal for showing refund status */}
                {refundModalMessage && showRefundModal && (
                    <div className="modalOverlay">
                        <div className="modalContent">
                            <p>{refundModalMessage}</p>
                            <button className="refundModalButton" onClick={handleRefundModal}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default SettingsPage;