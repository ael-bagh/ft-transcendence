/* This example requires Tailwind CSS v2.0+ */
import { forwardRef, useEffect, useState, useContext } from "react";
import { useSocket } from "../../hooks/api/useSocket";
import axiosInstance from "../../lib/axios";
import sock from "../../lib/socket";
import AvatarByLogin from "../user/AvatarByLogin";
import { NotificationsContext } from "../../contexts/notifications.context";

function Notification(props: { notification: Notification }, ref: any) {
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const [show, setShow] = useState(true);
  const [avatar, setAvatar] = useState("");
  useEffect(() => {
    axiosInstance
      .get("/user/" + props.notification.notification_sender_login)
      .then((res) => {
        setAvatar(res.data.avatar);
      }).catch(() => {});
  }, [notifications, show]);
  if (show)
    return (
      <div
        ref={ref}
        className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5"
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <AvatarByLogin
                login={props.notification.notification_sender_login}
              />
            </div>
            {props.notification.notification_type === "FRIEND_REQUEST" && (
              <FriendRequestComponent
                notification={props.notification}
                setShow={setShow}
              />
            )}
            {props.notification.notification_type === "GAME_INVITE" && (
              <GameInviteComponent
                notification={props.notification}
                setShow={setShow}
              />
            )}
            {props.notification.notification_type === "NEW_FRIEND" && (
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {props.notification.notification_sender_login}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  is now on your friend list.
                </p>
                <button
                  onClick={async () => {
                    sock.emit(
                      "dismiss",
                      { id: props.notification.notification_id },
                      (data: any) => {
                        setShow(false);
                      }
                    );
                    await axiosInstance.get("/notifications").then((res) => {
                      setNotifications(res.data);
                    }).catch(() => {});
                  }}
                  type="button"
                  className=" mt-2 inline-flex px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  return <></>;
}

// This is used to fix the issue with the ref not being passed to the component correctly in the Menu.Item
export default forwardRef(Notification);

function FriendRequestComponent({
  notification,
  setShow,
}: {
  notification: Notification;
  setShow: (x: boolean) => void;
}) {
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const { sendFriendRequest, deleteFriendRequest } = useSocket();
  const onAccept = () => {
    sendFriendRequest({
      target_login: notification.notification_sender_login,
    }).then(() => {
      setShow(false);
      axiosInstance.get("/notifications").then((res) => {
        setNotifications(res.data);
      }).catch(() => {});
    });
  };
  const onDecline = () => {
    deleteFriendRequest({
      target_login: notification.notification_sender_login,
    }).then(() => setShow(false)).catch(() => {});
  };
  return (
    <div className="ml-3 w-0 flex-1">
      <p className="text-sm font-medium text-gray-900">
        {notification.notification_sender_login}
      </p>
      <p className="mt-1 text-sm text-gray-500">Sent you a friend request.</p>
      <div className="mt-4 flex">
        <button
          onClick={onAccept}
          type="button"
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Accept
        </button>
        <button
          onClick={onDecline}
          type="button"
          className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

function GameInviteComponent({
  notification,
  setShow,
}: {
  notification: Notification;
  setShow: (x: boolean) => void;
}) {
  const { notifications, setNotifications } = useContext(NotificationsContext);
  const { sendFriendRequest, deleteFriendRequest } = useSocket();
  const onAccept = () => {
    sock.emit("accept_game_request", {
      isAccepted: true,
      target_login: notification.notification_sender_login,
      mode: notification.notification_payload?.mode,
      roomId: notification.notification_payload?.roomId,
    });
  };
  const onDecline = () => {
    sock.emit("accept_game_request", {
      isAccepted: false,
      target_login: notification.notification_sender_login,
      mode: notification.notification_payload?.mode,
      roomId: notification.notification_payload?.roomId,
    });
  };

  return (
    <div className="ml-3 w-0 flex-1">
      <p className="text-sm font-medium text-gray-900">
        {notification.notification_sender_login}
      </p>
      <p className="mt-1 text-sm text-gray-500">Challenged you to a game.</p>
      <div className="mt-4 flex">
        <button
          onClick={onAccept}
          type="button"
          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Accept
        </button>
        <button
          onClick={onDecline}
          type="button"
          className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
