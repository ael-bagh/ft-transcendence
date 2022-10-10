import { useParams, Form, useNavigate } from "react-router-dom";
import UserAvatar from "../user/UserAvatar";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TwoFactorAuth() {
  const { login } = useParams();
  const [code, setCode] = useState("");
  const [retry, setRetry] = useState("");
  const navigate = useNavigate();
  const handleSubmit = () => {
  const lol = axios.post(import.meta.env.VITE_API_URL + "/2fa/generate/");
  console.log(lol);
  }
  return (
    <div className="mt-4 bg-white text-3xl flex flex-col justify-center items-center p-8">
      <h1>Sign Up - Set 2FA</h1>
        <p>
          Scan the QR Code in the Authenticator app then enter the code that you
          see in the app in the text field and click Submit.
        </p>
        <img src="" className="img-fluid" />
        <div className="mb-3">
          <label className="form-label">2FA Code</label>
          <input
            type="text"
            className="form-control"
            id="secret"
            name="secret"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="mb-3 bg-red-500 text-white">
            {retry}
        </div>
        <button type="submit" className="bg-purple-500 p-2 text-white" onClick={handleSubmit}>
          Submit
        </button>
    </div>
  );
}
