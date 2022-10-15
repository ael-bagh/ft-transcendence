import { Dialog, Transition } from "@headlessui/react";
import QRCode from "react-qr-code";
import MainLayout from "../layout/MainLayout";
import { Form } from "react-router-dom";
import ImageUploading from "react-images-uploading";
import { useState, Fragment, useEffect, useContext } from "react";
import axiosInstance from "../../lib/axios";
import { Spinner } from "../layout/Loading";
import { AuthUserContext } from "../../contexts/authUser.context";
import { toast } from "react-toastify";

async function generateToken(user: User) {
  const mail = user?.email;
  const service = "ft_transcendance";
  const { secret } = await axiosInstance
    .get("/2fa/generate")
    .then((res) => res.data).catch(() => ({ secret: "" }));
  return {
    secret,
    otpauth: `otpauth://totp/${mail}?secret=${secret}&issuer=${service}`,
  };
}

export default function ProfileEdit() {
  const { authUser } = useContext(AuthUserContext);

  return (
    <MainLayout>
      {authUser && <ProfileEditComponent authUser={authUser} />}
    </MainLayout>
  );
}

function ProfileEditComponent({ authUser }: { authUser: User }) {
  const [avatar, setAvatar] = useState(authUser?.avatar);
  const [image, setImage] = useState([]);
  const [base64, setBase64] = useState(authUser?.avatar || "");
  const [name, setName] = useState(authUser?.nickname);
  const [is_available, setIsAvailable] = useState("unchanged");
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (imageList: any) => {
    setImage(imageList);
    setBase64(imageList[0]?.data_url);
  };

  useEffect(() => {
    if (name && name != "" && name?.length > 3) {
      if (name === authUser?.nickname) {
        setIsAvailable("unchanged");
      } else {
        setIsLoading(true);
        axiosInstance.get("/user/is_available/" + name).then((res) => {
          setIsAvailable(res.data ? "available" : "unavailable");
          setIsLoading(false);
        }).catch(() => {});
      }
    } else {
      setIsAvailable("unavailable");
    }
  }, [name, is_available]);

  return (
    <div className="flex flex-col w-full">
      <ImageUploading
        value={image}
        onChange={onChange}
        maxNumber={1}
        dataURLKey="data_url"
      >
        {({ imageList, onImageUpload, onImageRemove, dragProps }) => (
          <div
            className="sm:h-96 w-full flex justify-center items-center"
            {...dragProps}
          >
            {imageList.length === 0 && (
              <div className="sm:absolute">
                <img
                  className="sm:h-44 sm:w-44 h-full mx-auto mb-8 sm:rounded-full w-screen sm:object-contain"
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
                      setBase64(
                        `https://avatars.dicebear.com/api/micah/${authUser?.login}.svg`
                      );
                      setAvatar(
                        `https://avatars.dicebear.com/api/micah/${authUser?.login}.svg`
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
                <img
                  src={imageList[0]["data_url"]}
                  alt="avatar"
                  className="sm:h-44 sm:w-44 sm:p-4 sm:bg-purple-500 h-full mx-auto mb-8 sm:rounded-full w-screen sm:object-contain"
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
        action={"/profile/edit"}
        className="p-4 flex flex-col gap-4"
      >
        <div className="flex flex-col">
          <div className="flex">
            <span className="inline-flex items-center w-10 px-3 text-sm text-gray-900 bg-gray-200 rounded-l-md border border-r-0 border-gray-300">
              {isLoading && <Spinner />}
              {is_available === "unavailable" && "❌"}
              {is_available === "available" && "✅"}
            </span>
            <input
              type="text"
              id="website-admin"
              className="rounded-none rounded-r-lg bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5"
              value={name}
              name="nickname"
              onChange={(e) => setName(e.target.value)}
            />
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
          submit
        </button>
      </Form>
      <div className="relative">
        {authUser?.two_factor_auth_enabled ? (
          <TwoFAOff />
        ) : (
          <TwoFAOn user={authUser!} />
        )}
      </div>
    </div>
  );
}

function TwoFAOn({ user }: { user: User | null }) {
  const [code, setCode] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mfa, setMFA] = useState<Record<string, string> | null>(null);

  function closeModal() {
    axiosInstance
      .post(
        import.meta.env.VITE_API_URL + "/2fa/enable",
        { code, secret: mfa?.secret },
        { withCredentials: true }
      )
      .then(() => {
        toast("2FA enabled successfully", { type: "success" });
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch(() => toast("Invalid 2FA code", { type: "error" }));

    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  useEffect(() => {
    user && generateToken(user).then((res) => setMFA(res));
  }, []);

  return (
    <>
      <div className=" inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-green-500  px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Enable 2FA
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
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
                      {mfa && <QRCode value={mfa.otpauth} />}
                    </div>
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                      <input
                        onChange={(e) => setCode(e.target.value)}
                        type="text"
                        name="secret"
                        className="w-full "
                      />
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

function TwoFAOff() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");

  function closeModal() {
    axiosInstance
      .post(
        import.meta.env.VITE_API_URL + "/2fa/disable",
        { code },
        { withCredentials: true }
      )
      .then(() => {
        toast("2FA disabled successfully", { type: "success" });
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch(() => toast("Invalid 2FA code", { type: "error" }));

    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className=" inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-green-500  px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Disable 2FA
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
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
                      <input
                        type="text"
                        name="code"
                        id="code"
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full "
                      />
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
