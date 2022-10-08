import React, { useEffect, useState, createContext } from "react";
import { useSocket } from "../hooks/api/useSocket";

interface NotificationsContextInterface {
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
}

const NotificationsContextDefaultValues: NotificationsContextInterface = {
    notifications: [],
    setNotifications: () => null,
};

export const NotificationsContext = createContext<NotificationsContextInterface>(
    NotificationsContextDefaultValues
);

const NotificationsProvider = ({ children }: { children?: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { socket } = useSocket();

    useEffect(() => {
        socket.on("notification", (n: Notification) => {
            setNotifications([n, ...notifications]);
        });

        return () => {
            socket.off("notification");
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
}