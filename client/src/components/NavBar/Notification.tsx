/* This example requires Tailwind CSS v2.0+ */
import { forwardRef, useState } from "react";
import { useSocket } from "../../hooks/api/useSocket";

function Notification(props: { notification: Notification }, ref: any) {
  const [show, setShow] = useState(true);

  return (
    <div
      ref={ref}
      className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <img
              className="h-10 w-10 rounded-full"
              src={`https://avatars.dicebear.com/api/avataaars/${props.notification.notification_sender_login}.svg`}
              alt=""
            />
          </div>
          {props.notification.notification_type === "FRIEND_REQUEST" && (
            <FriendRequestComponent
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  const { sendFriendRequest, deleteFriendRequest } = useSocket();
  const onAccept = () => {
    sendFriendRequest({
      target_login: notification.notification_sender_login,
    }).then(() => setShow(false));
  };
  const onDecline = () => {
    deleteFriendRequest({
      target_login: notification.notification_sender_login,
    }).then(() => setShow(false));
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
