import '../Components/App.tsx'
import { ipcRenderer } from 'electron';
import NavBar from './NavBar.tsx';
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
    //const accountId = sessionStorage.getItem('AccountID')
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
        if (selectedProduct === "") {
            setShowRefundModal(true)
            setRefundModalMessage("Please select a product to refund.");
        } else {
            await ipcRenderer.invoke('removeProduct', accountId, selectedProduct)
            setShowRefundModal(true)
            setRefundModalMessage(`Product with ID ${selectedProduct} refunded successfully.`);
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

    return (
        <>
            <div>
                <NavBar />
            </div>

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
                    <p className='refundProductText'>Choose a product to refund from your purchased products</p>
                    <select className='refundProductDropdown' value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                        <option value="">-- Select a Product to Refund --</option>
                        {productData.map(product => (
                            <option key={product.ProductID} value={product.ProductID}>
                                {product.ProductName} -- £{product.CostOfPurchase}
                            </option>
                        ))}
                    </select>

                    <p className='refundProductText'>Click here to refund the product</p>

                    <button className='refundProductButton' onClick={(handleRefund)}>Refund Product</button>
                </div>
            </div>

            <div className='deleteAccount'>
                <h3 className='settingsHeader'>Delete account</h3>

                <div>
                    <p className='deleteAccountText'>This will remove all account information and product purchases permanently</p>
                    <p className='deleteAccountText'>Click here to delete account</p>

                    <button className='deleteAccountButton' onClick={(confirmDelete)}>Delete Account</button>
                </div>
            </div>

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
        </>
    )
}

export default SettingsPage;