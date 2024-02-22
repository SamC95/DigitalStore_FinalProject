import '../Components/App.tsx'
import { useParams } from 'react-router-dom';
import NavBar from './NavBar.tsx';
import SearchBar from './SearchBar.tsx';

function ProductPage() {
    const { gameId } = useParams();

    console.log(gameId)

    return (
        <>
        <div>
            <NavBar/>
        </div>

        <div>
            <SearchBar/>
        </div>

        <h1>You navigated to a product page!</h1>
        </>
    )
}

export default ProductPage;