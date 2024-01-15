import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Start from '../Components/Start.tsx'
import Login from '../Components/Login.tsx'
import AccountCreate from '../Components/AccountCreate.tsx'
import StoreMainPage from '../Components/StoreMainPage.tsx'
import '../Styles/App.css'
import '../Styles/index.css'
import '../Styles/CloseApp.css'
import '../Styles/MaximiseApp.css'
import '../Styles/MinimiseApp.css'
import { ipcRenderer } from 'electron'

function App() {

    return (
        <div>
            <button className='CloseButton' onClick={() => {
                ipcRenderer.send('closeApp')
            }}>
                X
            </button>
            <button className='Maximise' onClick={() => {
                ipcRenderer.send('maximiseApp')
            }}
            >
                {String.fromCharCode(128470)}
            </button>
            <button className='Minimise' onClick={() => {
                ipcRenderer.send('minimiseApp')
            }}>
                {String.fromCharCode(8210)}
            </button>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Start />}> </Route>
                    <Route path="/login-page" element={<Login />}> </Route>
                    <Route path="/account-create" element={<AccountCreate />}> </Route>
                    <Route path="/store-main-page" element={<StoreMainPage/>}> </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App;
