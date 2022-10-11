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

const NotificationsProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    axiosInstance.get("/notifications").then((res) => {
      setNotifications(res.data);
    });
    socket.on("notification", (notification: Notification) => {
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
