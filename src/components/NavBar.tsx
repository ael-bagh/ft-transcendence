import Button from './Button';
import logo from './games.png'
function login() {
    console.log("Login");
}
function NavBar() {
    return (
        <div className="nav">
            <div className='logo'>
                <img alt="logo" src={logo} width="30"/>
                <p>Tandenden</p>
            </div>
            <ul>
                <li><a>Home</a></li>
                <li><a>About</a></li>
                <li><a>Contact</a></li>
            </ul>
            <Button className='secondary' label='GET STARTED' onClick={login}/>
        </div>
    )
}

export default NavBar
