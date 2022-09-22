import { useState, useContext } from "react";
import logo from "./imgs/logo.png";
import { CgMenu } from "react-icons/cg";
import { Link } from "react-router-dom";
import l42 from "./imgs/42_Logo.svg.png";
import { AuthUserContext } from "../contexts/authUser.context";
import UserAvatar from "./user/UserAvatar";
import { User } from "../types/user.interface";

function NavBar() {
  const { authUser} = useContext(AuthUserContext);
  const [show, setShow] = useState(false);
  const ugh = "absolute w-0 sm:hidden text-white text-center gap-10 h-0 hidden";
  return (
    <div>
      <div className="nav">
        <div className="logo">
          <img alt="logo" src={logo} width="200" />
          <button onClick={() => setShow(!show)}>
            <CgMenu className="menu" />
          </button>
        </div>
        <ul>
          <li>
            <Link to="/">HOME</Link>
          </li>
          <li>
            <Link to="/profile">TEAM</Link>
          </li>
          <li>
            <Link to="/leaderboard">LEADERBORD</Link>
          </li>
        </ul>
        {!authUser && <a
          className="hidden sm:flex flex-row gap-2 bg-white text-black items-center justify-center p-2 hover:bg-purple-500"
          href="http://backend.transcendance.com/auth/login"
        >
          <img src={l42} className="h-5 w-5" alt="" />
          <p className=" font-levi">Login</p>
        </a>}
        {
            authUser && <UserAvatar user={authUser} />
        }
        
      </div>

      <div
        className={
          show
            ? "flex flex-col absolute w-screen top-16 sm:hidden bg-black text-white text-center gap-10 z-50"
            : ugh
        }
      >
        <ul className="mobileMenu">
          <li>
            <Link to="/Profile">HOME</Link>
          </li>
          <li>
            <Link to="/allo">TEAM</Link>
          </li>
          <li>
            <Link to="/allo">LEADERBORD</Link>
          </li>
          <li>
            <a
              className="flex flex-row gap-2 bg-white text-black items-center justify-center p-2 hover:bg-purple-500"
              href="http://backend.transcendance.com/auth/login"
            >
              <img src={l42} className="h-5 w-5" alt="" />
              <p className=" font-bold">Login</p>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavBar;
