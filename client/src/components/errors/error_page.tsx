import { useRouteError } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { Link } from "react-router-dom";
import {BsArrowBarRight} from "react-icons/bs";

export default function ErrorPage() {
  const error = useRouteError() as { statusText: string; message: string };
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white h-screen w-screen">
      <Player
        autoplay
        loop
        src="https://assets6.lottiefiles.com/packages/lf20_oouh4yik.json"
        style={{ height: "300px", width: "300px" }}
      ></Player>
      <div className="flex flex-row items-center justify-between gap-40">
        <p className="text-xl text-center md:text-3xl font-minecraft">
          {error.statusText || error.message}
        </p>
        <Link className="text-xl underline md:text-3xl font-minecraft" to="/">
          <div className="flex">Go Home <BsArrowBarRight/></div>
        </Link>
      </div>
    </div>
  );
}
