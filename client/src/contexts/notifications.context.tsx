import React, { useEffect, useState, createContext } from "react";
import { useSocket } from "../hooks/api/useSocket";
import axiosInstance from "../lib/axios";

interface NotificationsContextInterface {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}

const NotificationsContextDefaultValues: NotificationsContextInterface = {
  notifications: [],
  setNotifications: () => null,
};

export const NotificationsContext =
  createContext<NotificationsContextInterface>(
    NotificationsContextDefaultValues
  );

function safeJSONParse(payload?: string) {
  try {
    return JSON.parse(payload || "");
  } catch (error) {
    return {};
  }
}

const NotificationsProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    axiosInstance.get("/notifications").then((res) => {
      setNotifications(
        res.data?.map((notification: any) => {
          return {
            ...notification,
            notification_payload: safeJSONParse(
              notification.notification_payload
            ),
          };
        }) || []
      );
    });
    socket.on("notification", (notification: Notification) => {
      notification.notification_payload = safeJSONParse(
        notification.notification_payload
      );

      console.log("notification recieved", notification);
      if (notification.notification_type)
        setNotifications((prev) => [notification, ...prev]);
      else
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notification.notification_id)
        );
    });

    return () => {
      socket.off("notifications");
    };
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
