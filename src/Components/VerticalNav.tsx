import {Link} from 'react-router-dom';
import '../Styles/VerticalNav.css'

const VerticalNav = () =>  {

    return (
    <>
    <nav className='verticalNav'>
        <h4>Search by Genre</h4>
        <Link className='verticalNav_li' to="/store-main-page">Adventure</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Arcade</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Card & Board Game</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Fighting</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Indie</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Platform</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Puzzle</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Racing</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Real-time Strategy</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Role-Playing Game</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Sport</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Simulator</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Turn-based strategy</Link>
        <br></br>
        <h4>Categories</h4>
        <Link className='verticalNav_li' to="/store-main-page">New Releases</Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page">Upcoming</Link>
        <br></br>
        <h4>Recently Viewed</h4>
        <Link className='verticalNav_li' to="/store-main-page"></Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page"></Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page"></Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page"></Link>
        <br></br>
        <Link className='verticalNav_li' to="/store-main-page"></Link>
        <br></br>
    </nav>
    </>
    )
}

export default VerticalNav;