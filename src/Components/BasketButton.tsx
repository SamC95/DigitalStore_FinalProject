import { BsBasket2Fill } from "react-icons/bs";
import '../Styles/BasketButton.css'


function BasketButton() {

    function handleClick() {
        
    }

    return (
        <>
        <button className='basketButton'>
            <BsBasket2Fill className='basketIcon' onClick={() => handleClick()} size={20}/>
        </button>
        </>
    )

}

export default BasketButton;