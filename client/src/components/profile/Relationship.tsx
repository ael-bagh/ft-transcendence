import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState, useContext } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { AuthUserContext } from "../../contexts/authUser.context";
import { useSocket } from "../../hooks/api/useSocket";
import { useRelation } from "../../hooks/api/useUser";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import sock from "../../lib/socket";

export default function Relationship(props: { user: User | null }) {
  const { relation } = useRelation(props.user?.login);
  const [isSelf, setIsSelf] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isRequestReceived, setIsRequestReceived] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const {
    sendFriendRequest,
    deleteFriend,
    deleteFriendRequest,
    deleteSentFriendRequest,
    blockUser,
    unblockUser,
  } = useSocket();
  const { authUser } = useContext(AuthUserContext);
  const onRequestSent = () => {
    sendFriendRequest({
      target_login: props.user?.login,
    })
      .then((ret) => {
        console.log("ha ana:" ,ret)
        if (isRequestReceived) {
          setIsFriend(true);
          setIsRequestReceived(false);
          setIsRequestSent(false);
        } else {
          if (ret) setIsFriend(true);
          else setIsRequestSent(true);
        }
      })
      .catch((err) => console.log(err));
  };

  const onDeleteFriendRequest = () => {
    deleteFriendRequest({
      target_login: props.user?.login,
    })
      .then(() => {
        setIsRequestReceived(false);
        setIsFriend(false);
        setIsRequestSent(false);
      })
      .catch((err) => console.log(err));
  };
  const onCancelRequest = () => {
    deleteSentFriendRequest({
      target_login: props.user?.login,
    })
      .then(() => {
        setIsRequestSent(false);
      })
      .catch((err) => console.log(err));
  };
  const onDeleteFriend = () => {
    deleteFriend({
      target_login: props.user?.login,
    }).finally(() => {
      setIsFriend(false);
      setIsRequestReceived(false);
      setIsRequestSent(false);
    });
  };
  const onBlockRequest = () => {
    blockUser({
      target_login: props.user?.login,
    }).finally(() => setIsBlocked(true));
  };
  const onUnblockRequest = () => {
    unblockUser({
      target_login: props.user?.login,
    }).finally(() => setIsBlocked(false));
  };
  const navigate = useNavigate();
  const onSendMessage = () => {
    axiosInstance
      .post("/rooms/create_direct_message/" + props.user?.login)
      .then((ret) => {
        navigate("/chat/" + ret.data);
      });
  };
  const onChallenge = () => {
    sock.emit("invite_to_game", {target_login: props.user?.login, mode: "ONE"} ,(data: any) => {
      navigate("/game/" + data);
    });
  };
  useEffect(() => {
    if (relation.is_self) setIsSelf(true);
    if (relation?.is_friend) setIsFriend(true);
    if (relation?.is_blocked) setIsBlocked(true);
    if (relation?.is_request_sent) setIsRequestSent(true);
    if (relation?.is_request_received) setIsRequestReceived(true);
  }, [relation]);
  useEffect(() => {}, [isFriend, isRequestReceived, isRequestSent, isBlocked]);

  return (
    <div className="">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            Actions
            <ChevronDownIcon
              className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              {isSelf && (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      className={`${
                        active ? "bg-violet-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      to={"/profile/edit"}
                    >
                      {" "}
                      {active ? (
                        <EditActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <EditInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      Edit My profile
                    </Link>
                  )}
                </Menu.Item>
              )}
              {!isFriend && isRequestSent && !isSelf && !isBlocked && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onCancelRequest}
                      className={`${
                        active ? "bg-violet-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {active ? (
                        <DuplicateActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <DuplicateInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      cancel request
                    </button>
                  )}
                </Menu.Item>
              )}
              {!isSelf && !isBlocked && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onChallenge}
                      className={`${
                        active ? "bg-violet-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {active ? (
                        <DuplicateActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <DuplicateInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      Challenge
                    </button>
                  )}
                </Menu.Item>
              )}
              {!isFriend &&
                !isRequestSent &&
                !isRequestReceived &&
                !isSelf &&
                !isBlocked && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onRequestSent}
                        className={`${
                          active ? "bg-violet-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {active ? (
                          <DuplicateActiveIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <DuplicateInactiveIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        )}
                        Add Friend
                      </button>
                    )}
                  </Menu.Item>
                )}
              {!isFriend &&
                isRequestReceived &&
                !isRequestSent &&
                !isSelf &&
                !isBlocked && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onRequestSent}
                        className={`${
                          active ? "bg-violet-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {active ? (
                          <DuplicateActiveIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <DuplicateInactiveIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        )}
                        Accept
                      </button>
                    )}
                  </Menu.Item>
                )}
              {!isFriend &&
                isRequestReceived &&
                !isRequestSent &&
                !isSelf &&
                !isBlocked && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onDeleteFriendRequest}
                        className={`${
                          active ? "bg-violet-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {active ? (
                          <DuplicateActiveIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <DuplicateInactiveIcon
                            className="mr-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        )}
                        Delete Request
                      </button>
                    )}
                  </Menu.Item>
                )}
              {isFriend && !isSelf && !isBlocked && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onDeleteFriend}
                      className={`${
                        active ? "bg-violet-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {active ? (
                        <DuplicateActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <DuplicateInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      Delete Friend
                    </button>
                  )}
                </Menu.Item>
              )}
            </div>
            <div className="px-1 py-1">
              {!isBlocked && !isSelf && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onBlockRequest}
                      className={`${
                        active ? "bg-violet-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {active ? (
                        <ArchiveActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <ArchiveInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      Block
                    </button>
                  )}
                </Menu.Item>
              )}
              {isBlocked && !isSelf && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onUnblockRequest}
                      className={`${
                        active ? "bg-violet-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {active ? (
                        <ArchiveActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <ArchiveInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      Unblock
                    </button>
                  )}
                </Menu.Item>
              )}
              {!isBlocked && !isSelf && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onSendMessage}
                      className={`${
                        active ? "bg-violet-500 text-white" : "text-gray-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {active ? (
                        <MoveActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <MoveInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      Send Message
                    </button>
                  )}
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

function EditInactiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 13V16H7L16 7L13 4L4 13Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="2"
      />
    </svg>
  );
}

function EditActiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 13V16H7L16 7L13 4L4 13Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
    </svg>
  );
}

function DuplicateInactiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4H12V12H4V4Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="2"
      />
      <path
        d="M8 8H16V16H8V8Z"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="2"
      />
    </svg>
  );
}

function DuplicateActiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4H12V12H4V4Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
      <path
        d="M8 8H16V16H8V8Z"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
    </svg>
  );
}

function ArchiveInactiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="8"
        width="10"
        height="8"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="2"
      />
      <rect
        x="4"
        y="4"
        width="12"
        height="4"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="2"
      />
      <path d="M8 12H12" stroke="#A78BFA" strokeWidth="2" />
    </svg>
  );
}

function ArchiveActiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="8"
        width="10"
        height="8"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
      <rect
        x="4"
        y="4"
        width="12"
        height="4"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
      <path d="M8 12H12" stroke="#A78BFA" strokeWidth="2" />
    </svg>
  );
}

function MoveInactiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 4H16V10" stroke="#A78BFA" strokeWidth="2" />
      <path d="M16 4L8 12" stroke="#A78BFA" strokeWidth="2" />
      <path d="M8 6H4V16H14V12" stroke="#A78BFA" strokeWidth="2" />
    </svg>
  );
}

function MoveActiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 4H16V10" stroke="#C4B5FD" strokeWidth="2" />
      <path d="M16 4L8 12" stroke="#C4B5FD" strokeWidth="2" />
      <path d="M8 6H4V16H14V12" stroke="#C4B5FD" strokeWidth="2" />
    </svg>
  );
}

function DeleteInactiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="6"
        width="10"
        height="10"
        fill="#EDE9FE"
        stroke="#A78BFA"
        strokeWidth="2"
      />
      <path d="M3 6H17" stroke="#A78BFA" strokeWidth="2" />
      <path d="M8 6V4H12V6" stroke="#A78BFA" strokeWidth="2" />
    </svg>
  );
}

function DeleteActiveIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="6"
        width="10"
        height="10"
        fill="#8B5CF6"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
      <path d="M3 6H17" stroke="#C4B5FD" strokeWidth="2" />
      <path d="M8 6V4H12V6" stroke="#C4B5FD" strokeWidth="2" />
    </svg>
  );
}
