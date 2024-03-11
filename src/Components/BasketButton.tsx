import { BsBasket2Fill } from "react-icons/bs";
import '../Styles/BasketButton.css'
import { useNavigate } from "react-router-dom";


function BasketButton() {
    const navigate = useNavigate();

    function handleClick() {
        navigate('/checkout')
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