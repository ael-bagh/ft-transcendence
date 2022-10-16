import Sample from "../imgs/sample.mp4";
import logo from "../imgs/logo.png";
import {useContext, useState } from "react";
import { AuthUserContext } from "../../contexts/authUser.context";
import { Navigate } from "react-router-dom";
import { BsArrowBarLeft, BsArrowBarRight, BsGithub } from "react-icons/bs";
import logod42 from "../imgs/42_Logo_W.png"

export default function Home() {
  const { authUser } = useContext(AuthUserContext);
  const [show, setShow] = useState(false);
  function handleClick() {
    setShow(!show);
  }
  if (authUser) return <Navigate to={"/profile/" + authUser?.login} replace />;
  return (
    <div className="h-screen w-screen p-0 m-0 flex flex-col-reverse sm:flex-row">
      <div className="bg-purple-500 w-full sm:w-3/5 h-1/3 sm:h-full rounded-t-xl sm:rounded-r-xl flex flex-col  justify-center items-center">
        <img src={logo} alt="" className="flex-none w-96 h-auto" />
        <a
          href={import.meta.env.VITE_API_URL + "/auth/login"}
          className="animate-bounce bg-black text-white text-xl font-minecraft border border-gray-50 p-2 flex flex-row items-center mt-2"
        >
          <img
            src={logod42}
            className="h-6"
            alt="42 LOGO"
          />
          <div>Login</div>
        </a>
        <div
          className="flex flex-row-reverse justify-between items-center gap-8 absolute bottom-3 left-3 hover:cursor-pointer"
          onClick={handleClick}
        >
          <div className="text-xl text-white underline font-minecraft">
              {show && <div className="flex flex-row-reverse">Back <BsArrowBarLeft /> </div>}
          </div>
          <a
            className="text-xl text-white underline font-minecraft"
            target="_blank"
            href="https://github.com/ael-bagh/ft-transcendence"
          >
            <div>
              <BsGithub className="h-8 w-8" />
            </div>
          </a>
        </div>
      </div>
      <div className="bg-black w-full flex flex-col sm:flex-grow h-2/3 sm:h-full self-start">
        <div className="flex flex-grow relative justify-center items-center">
          <img
            src="https://i.kym-cdn.com/photos/images/original/002/174/536/2b1.gif"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
