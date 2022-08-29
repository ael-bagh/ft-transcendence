import { useState } from 'react';
import Button from './Button';
import logo from './imgs/logo.png';
import {CgMenu} from 'react-icons/cg';
import { Link } from "react-router-dom";
function login() {
    console.log("Login");
}

function NavBar() {
    const [show, setShow] = useState(false);
    const ugh = "flex flex-col sm:hidden text-white text-center gap-10 h-0 invisible";
    return (
        <div>
            <div className='nav'>
                <div className='logo'>
                    <img alt="logo" src={logo} width="200"/>
                    <button onClick={()=>setShow(!show)}><CgMenu className='menu'/></button>
                </div>
                <ul>
                    <li><Link to='/'>HOME</Link></li>
                    <li><Link to='/profile'>TEAM</Link></li>
                    <li><Link to='/leaderboard'>LEADERBORD</Link></li>
                </ul>
                <Button className='secondary nab' label='GET STARTED' onClick={login}/>
            </div>
            
            <div className={(show)?"flex flex-col sm:hidden text-white text-center gap-10" : ugh}>
                <ul className='mobileMenu'>
                    <li><Link to='/Profile'>HOME</Link></li>
                    <li><Link to='/allo'>TEAM</Link></li>
                    <li><Link to='/allo'>LEADERBORD</Link></li>
                </ul>
            </div>
        </div>
    )
}

export default NavBar
