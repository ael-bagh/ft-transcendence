import React from "react";
import ReactDOM from "react-dom";
import CryptoJS from "crypto-js";
import QRCode from "react-qr-code";
import MainLayout from "../layout/MainLayout";
import { Form } from "react-router-dom";
import ImageUploading from "react-images-uploading";
import { useLoaderData } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";
import { Spinner } from "../layout/Loading";
// import crypto from 'crypto';

// const isValid = (token: string, secret: string) =>
  // authenticator.check(token, secret);

function generateToken() {
  const { data: user } = useLoaderData() as { data: User };

  const mail = user?.email;
  const service = 'ft_transcendance';
  
  const secret = CryptoJS.HmacSHA1(mail, service).toString();
  const otpauth = `otpauth://totp/${service}:${mail}?secret=${secret}&issuer=${service}`;

  return { secret, otpauth };
}

export default function ProfileEdit() {
  const { data: user } = useLoaderData() as { data: User | null };
  const [mfa] = useState(generateToken());
  const [avatar, setAvatar] = useState(
    user?.avatar ||
      `https://avatars.dicebear.com/api/avataaars/${user?.login}.svg`
  );
  const [image, setImage] = useState([]);
  const [base64, setBase64] = useState(user?.avatar || "");
  const onChange = (imageList: any, addUpdateIndex: any) => {
    console.log(imageList[0]?.data_url);
    setImage(imageList);
    setBase64(imageList[0]?.data_url);
  };
  const [name, setName] = useState(user?.nickname);
  const [showQRCode, setShowQr] = useState(user?.two_factor_auth_boolean);
  const [is_available, setIsAvailable] = useState("unchanged");
  const [isLoading, setIsLoading] = useState(false);
  const divStyle = {
    backgroundImage: "url(" + user?.avatar + ")",
  };
  useEffect(() => {
    console.log(name);
    if (name && name != "" && name?.length > 3) {
      if (name === user?.nickname) {
        setIsAvailable("unchanged");
      } else {
        setIsLoading(true);
        axiosInstance.get("/user/is_available/" + name).then((res) => {
          console.log("response", res.data);
          setIsAvailable(res.data ? "available" : "unavailable");
          setIsLoading(false);
        });
      }
    } else {
      setIsAvailable("unavailable");
    }
    console.log(name);
    console.log(is_available);
  }, [name, is_available]);

  return (
    <MainLayout>
      <div className="flex flex-col w-full">
        <ImageUploading
          value={image}
          onChange={onChange}
          maxNumber={1}
          dataURLKey="data_url"
        >
          {({
            imageList,
            onImageUpload,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps,
          }) => (
            // write your building UI
            <div
              className="sm:h-96 w-full flex justify-center items-center"
              {...dragProps}
            >
              {imageList.length === 0 && (
                <div className="sm:absolute">
                  {" "}
                  <img
                    className="sm:absolute sm:h-44 sm:w-44 h-full  sm:rounded-full w-screen sm:object-contain"
                    src={avatar}
                    alt="avatar"
                  />
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <button
                      className="relative bg-purple-500 p-2"
                      onClick={onImageUpload}
                    >
                      Change profile picture
                    </button>
                    <button
                      className="relative bg-red-500 p-2"
                      onClick={() => {
                        setBase64("");
                        setAvatar(
                          `https://avatars.dicebear.com/api/avataaars/${user?.login}.svg`
                        );
                      }}
                    >
                      delete
                    </button>
                  </div>
                </div>
              )}
              {imageList.length !== 0 && (
                <div className="sm:absolute">
                  {" "}
                  <img
                    src={imageList[0]["data_url"]}
                    alt="avatar"
                    className="sm:absolute sm:h-44 sm:w-44 sm:p-4 sm:bg-purple-500 h-full  sm:rounded-full w-screen sm:object-contain"
                  />
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <button
                      className="relative bg-purple-500 p-2"
                      onClick={onImageUpload}
                    >
                      Change profile picture
                    </button>
                    <button
                      className="relative bg-red-500 p-2"
                      onClick={() => onImageRemove(0)}
                    >
                      delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </ImageUploading>
        <Form
          method="put"
          action={"/profile/" + user + "/edit"}
          className="p-4 flex-col gap-4"
        >
          <div className="flex flex-col">
            <div className="flex">
              <span className="inline-flex items-center w-10 px-3 text-sm text-gray-900 bg-gray-200 rounded-l-md border border-r-0 border-gray-300 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                {isLoading && <Spinner />}
                {is_available === "unavailable" && "❌"}
                {is_available === "available" && "✅"}
              </span>
              <input
                type="text"
                id="website-admin"
                className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={name}
                name="nickname"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex items-center pl-4">
              {!user?.two_factor_auth_boolean && (
                <div
                  onClick={() => setShowQr(!showQRCode)}
                  className="relative bg-gray-500 p-2 hover:cursor-pointer"
                >
                  {!showQRCode ? "Enable 2FA" : "Disable 2FA"}
                  {/* {"Enable 2FA"} */}
                </div>
              )}
              {showQRCode && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    <div style={{ background: "white", padding: "16px" }}>
                      <QRCode value={mfa.otpauth} />
                    </div>
                    <input type="text" name="secret" />
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              name="avatar"
              value={base64}
              onChange={(e) => e}
              hidden
            />
          </div>
          <button
            className="bg-purple-500 p-2 w-full disabled:bg-gray-500 disabled:hover:cursor-not-allowed"
            type="submit"
            disabled={is_available === "unavailable"}
          >
            {" "}
            submit
          </button>
        </Form>
      </div>
    </MainLayout>
  );
}
