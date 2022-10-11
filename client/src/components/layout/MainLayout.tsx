import React, { useContext } from "react";
import { AuthUserContext } from "../../contexts/authUser.context";
import NavBar from "../NavBar/NavBar";
import Queue from "./Queue";
import { NotificationsContext } from "../../contexts/notifications.context";
import Notification from "../NavBar/Notification";
import GameInvite from "./GameInvite";

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isAuthLoaded, authUser } = useContext(AuthUserContext);
  const {notifications} = useContext(NotificationsContext);
  return (
    <>
      {isAuthLoaded && authUser && (
        <div className="text-white flex flex-col h-screen">
          <div className="flex flex-col w-screen">
            <NavBar />
            <Queue />
            <GameInvite />
          </div>
          <div className="flex h-full">
            {/* {notifications.map((notification, index) => (
              <Notification notification={notification} key={index} />
            ))} */}
            {children}
          </div>
        </div>
      )}
    </>
  );
}
