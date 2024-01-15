import {Link} from 'react-router-dom';
import '../Styles/NavBar.css'

const NavBar = () => {
    
    return (
        <nav>
            <Link className='NavLink' to="/store-main-page">Store</Link>
            <Link className='NavLink' to="/store-main-page">Library</Link>
            <Link className='NavLink' to="/store-main-page">Settings</Link>
        </nav>
    )
}
export default NavBar;