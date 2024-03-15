import '../Components/App.tsx'
import { ipcRenderer } from 'electron';
import NavBar from './NavBar.tsx';


function ProductLibrary() {
    return (
        <>
            <div>
                <NavBar/>
            </div>

            <div>
                <h2>This is the product library page</h2>
            </div>
        </>
    )
}

export default ProductLibrary;