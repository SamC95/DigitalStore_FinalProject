import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Start from '../Components/Start.tsx'
import Login from '../Components/Login.tsx'
import AccountCreate from '../Components/AccountCreate.tsx'
import StoreMainPage from '../Components/StoreMainPage.tsx'
import SearchResults from './SearchResults.tsx'
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
                    <Route path="/search-results" element={<SearchResults/>}> </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App;
