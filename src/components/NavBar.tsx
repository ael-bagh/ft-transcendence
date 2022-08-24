import { useState } from 'react';
import Button from './Button';
import logo from './logo.png';
import {CgMenu} from 'react-icons/cg';
function login() {
    console.log("Login");
}

function NavBar() {
    const [show, setShow] = useState(false);
    const ugh = "flex flex-col sm:hidden text-white text-center gap-10 invisible";
    return (
        <div>
            <div className='nav'>
                <div className='logo'>
                    <img alt="logo" src={logo} width="200"/>
                    <button onClick={()=>setShow(!show)}><CgMenu className='menu'/></button>
                </div>
                <ul>
                    <li><a href='allo'>HOME</a></li>
                    <li><a href='allo'>TEAM</a></li>
                    <li><a href='allo'>LEADERBORD</a></li>
                </ul>
                <Button className='secondary nab' label='GET STARTED' onClick={login}/>
            </div>
            
            <div className={(show)?"flex flex-col sm:hidden text-white text-center gap-10" : ugh}>
                <ul className='mobileMenu'>
                    <li><a href='allo'>HOME</a></li>
                    <li><a href='allo'>TEAM</a></li>
                    <li><a href='allo'>LEADERBORD</a></li>
                </ul>
            </div>
        </div>
    )
}

export default NavBar
