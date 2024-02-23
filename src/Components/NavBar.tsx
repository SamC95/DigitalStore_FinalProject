import {Link} from 'react-router-dom';
import ApplicationButtons from './ApplicationButtons';
import '../Styles/NavBar.css'

const NavBar = () => {

    // ApplicationButtons is used to ensure that the close, minimise and maximise buttons are included as part of the NavBar
    return (
        <>
        <nav className='topNav'>
            <ApplicationButtons/>
            <Link className='NavLink' to="/store-main-page">Store</Link>
            <Link className='NavLink' to="/store-main-page">Library</Link>
            <Link className='NavLink' to="/store-main-page">Settings</Link>
        </nav>
        </>
    )
}
export default NavBar;