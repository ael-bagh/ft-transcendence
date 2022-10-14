import { useParams, Form, useNavigate } from "react-router-dom";
import UserAvatar from "../user/UserAvatar";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaQrcode } from "react-icons/fa";

export default function TwoFactorAuth() {
  const { login } = useParams();
  const [code, setCode] = useState("");
  const [retry, setRetry] = useState("");
  const navigate = useNavigate();
  const handleSubmit = () => {
    axios
      .post(
        import.meta.env.VITE_API_URL + "/2fa/authenticate/" + login,
        { code },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        window.location.href = '/profile/me';
      })
      .catch(() => {
        setRetry("Wrong code");
      });
  };
  return (
    <div className="bg-purple-500   ">
      <div className="flex justify-center container mx-auto my-auto w-screen h-screen items-center flex-col">
        <div className="text-slate-100 items-center"></div>
<FaQrcode className="text-white h-20 w-fit pb-4"/>
        <div className="w-full md:w-3/4  lg:w-1/2 flex flex-col items-center bg-slate-50 rounded-md pt-12">
        
          <div className="text-center pb-3">
            Please enter the 2FA code that you see in your QrAuth app
          </div>
          <div className="w-3/4 mb-6">
            <input
              type="text"
              name="secret"
              id="secret"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full py-4 px-8 bg-slate-200 placeholder:font-semibold rounded hover:ring-1 hover:ring-gray-600 outline-slate-500 border-solid border-2 border-slate-300"
            />
          </div>
          <div className="mb-3 bg-red-500 text-white">{retry}</div>
          <div className="w-3/4 mb-12">
            <button
              type="submit"
              onClick={handleSubmit}
              className="py-4 bg-purple-500 w-full rounded text-purple-50 font-bold hover:bg-purple-700"
            >
              {" "}
              LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
