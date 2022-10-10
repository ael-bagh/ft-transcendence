import React from "react";
import ReactDOM from "react-dom";
import { Dialog, Transition } from "@headlessui/react";
import CryptoJS from "crypto-js";
import QRCode from "react-qr-code";
import MainLayout from "../layout/MainLayout";
import { Form } from "react-router-dom";
import ImageUploading from "react-images-uploading";
import { useLoaderData } from "react-router-dom";
import { useState, Fragment, useEffect } from "react";
import axiosInstance from "../../lib/axios";
import { Spinner } from "../layout/Loading";
// import crypto from 'crypto';

// const isValid = (token: string, secret: string) =>
// authenticator.check(token, secret);

function generateToken() {
  const { data: user } = useLoaderData() as { data: User };

  const mail = user?.email;
  const service = "ft_transcendance";

  const secret = CryptoJS.HmacSHA1(mail, service).toString();
  const otpauth = `otpauth://totp/${service}:${mail}?secret=${secret}&issuer=${service}`;

  return { secret, otpauth };
}

export default function ProfileEdit() {
  const { data: user } = useLoaderData() as { data: User | null };

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
  // const [code, setCode] = useState(user?);
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
            {
              user?.two_factor_auth_boolean && (
                <TwoFAOff user={user}/>
              )
            }
            {
              !user?.two_factor_auth_boolean && (
                <TwoFAOn user={user}/>
              )
            }
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

function TwoFsAComponent({ user }: { user: User | null }) {
  const [mfa] = useState(generateToken());
  const [showQRCode, setShowQr] = useState(user?.two_factor_auth_boolean);

  return (
    <div className="flex items-center pl-4">
      {user?.two_factor_auth_boolean && (
        <div className="w-11/12 mx-auto mb-4 my-6 md:w-5/12 shadow sm:px-10 sm:py-6 py-4 px-4 bg-white dark:bg-gray-800 rounded-md">
          <div>
            <p className="text-lg text-gray-800 dark:text-gray-100 font-semibold pb-3">
              Enable 2FA
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 pb-3 font-normal">
              You can cancel the 2FA at any time
            </p>
            <div className="w-12 h-6 cursor-pointer rounded-full relative shadow-sm">
              <input
                onClick={() => setShowQr(!showQRCode)}
                type="checkbox"
                name="toggle"
                id="toggle1"
                className="focus:outline-none checkbox w-4 h-4 rounded-full bg-white absolute m-1 shadow-sm appearance-none cursor-pointer"
              />
              <label
                htmlFor="toggle1"
                className="toggle-label bg-gray-200 block w-12 h-6 overflow-hidden rounded-full bg-gray-300 cursor-pointer"
              />
            </div>
            {showQRCode && (
              <div className="w-5/12 mx-auto mb-4 my-6 md:w-5/12 shadow sm:px-10 sm:py-6 py-4 px-4 bg-white dark:bg-gray-800 rounded-md content-center">
                <div style={{ background: "white", padding: "16px" }}>
                  <QRCode value={mfa.otpauth} />
                </div>
                <input type="text" name="secret" className="w-full " />
                <button className="bg-purple-500 p-2 w-full">Confirm</button>
              </div>
            )}
          </div>
          <style>{`
          .checkbox:checked {
              /* Apply class right-0*/
              right: 0;
          }
          .checkbox:checked + .toggle-label {
              /* Apply class bg-indigo-700 */
              background-color: #4c51bf;
          }
          `}</style>
        </div>
      )}

      {!user?.two_factor_auth_boolean && (
        <div className="w-11/12 mx-auto mb-4 my-6 md:w-5/12 shadow sm:px-10 sm:py-6 py-4 px-4 bg-white dark:bg-gray-800 rounded-md">
          <div>
            <p className="text-lg text-gray-800 dark:text-gray-100 font-semibold pb-3">
              Enable 2FA
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 pb-3 font-normal">
              You can cancel the 2FA at any time
            </p>
            <div className="w-12 h-6 cursor-pointer rounded-full relative shadow-sm">
              <input
                onClick={() => setShowQr(!showQRCode)}
                type="checkbox"
                name="toggle"
                id="toggle1"
                className="focus:outline-none checkbox w-4 h-4 rounded-full bg-white absolute m-1 shadow-sm appearance-none cursor-pointer"
              />
              <label
                htmlFor="toggle1"
                className="toggle-label bg-gray-200 block w-12 h-6 overflow-hidden rounded-full bg-gray-300 cursor-pointer"
              />
            </div>
            {showQRCode && (
              <div className="w-5/12 mx-auto mb-4 my-6 md:w-5/12 shadow sm:px-10 sm:py-6 py-4 px-4 bg-white dark:bg-gray-800 rounded-md content-center">
                <div style={{ background: "white", padding: "16px" }}>
                  <QRCode value={mfa.otpauth} />
                </div>
                <input type="text" name="secret" className="w-full " />
                <button className="bg-purple-500 p-2 w-full">Confirm</button>
              </div>
            )}
          </div>
          <style>{`
          .checkbox:checked {
              /* Apply class right-0*/
              right: 0;
          }
          .checkbox:checked + .toggle-label {
              /* Apply class bg-indigo-700 */
              background-color: #4c51bf;
          }
          `}</style>
        </div>
        // </div>
      )}
    </div>
  );
}

function TwoFAOff({ user }: { user: User | null }) {
  const [mfa] = useState(generateToken());
  let [isOpen, setIsOpen] = useState(false);
  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-green-500  px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Enable 2FA
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Scan To Enable Your Two Factor Authentication
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                      <QRCode value={mfa.otpauth} />
                    </div>
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                      <input type="text" name="secret" className="w-full " />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => closeModal()}
                    >
                      Activate
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function TwoFAOn({ user }: { user: User | null }) {
  //const [mfa] = useState(generateToken());
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [retry, setRetry] = useState("");
  function closeModal() {
    axiosInstance.post(import.meta.env.VITE_API_URL + "/2fa/disable", {code}, {
      withCredentials: true,
    }).then((res) => {
      console.log(res);
      window.location.reload();
      // navigate("/profile/" + login);
      }).catch(() => {
          setRetry("Wrong code");
      });
  
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-green-500  px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Enable 2FA
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Enter Your Two Factor Authentication
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                      <input type="text" name="code" id="code" onChange={(e)=>setCode(e.target.value)} className="w-full "  />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => closeModal()}
                    >
                      Disable
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}