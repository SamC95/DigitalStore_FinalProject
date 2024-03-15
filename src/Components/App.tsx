import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Start from '../Components/Start.tsx'
import Login from '../Components/Login.tsx'
import AccountCreate from '../Components/AccountCreate.tsx'
import StoreMainPage from '../Components/StoreMainPage.tsx'
import ProductLibrary from './ProductLibrary.tsx'
import ProductPage from '../Components/ProductPage.tsx'
import SearchResults from './SearchResults.tsx'
import BasketCheckout from './BasketCheckout.tsx'
import SettingsPage from './SettingsPage.tsx'
import '../Styles/App.css'
import '../Styles/index.css'

function App() {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Start />}> </Route>
                    <Route path="/login-page" element={<Login />}> </Route>
                    <Route path="/account-create" element={<AccountCreate />}> </Route>
                    <Route path="/store-main-page" element={<StoreMainPage/>}> </Route>
                    <Route path="library-page" element={<ProductLibrary/>}> </Route>
                    <Route path="/search-results" element={<SearchResults/>}> </Route>
                    <Route path="/product-page/:gameId" element={<ProductPage/>}> </Route>
                    <Route path="/checkout" element={<BasketCheckout/>}> </Route>
                    <Route path="/settings" element={<SettingsPage/>}> </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App;
