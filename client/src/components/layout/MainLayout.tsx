import React, { useContext } from "react";
import { AuthUserContext } from "../../contexts/authUser.context";
import NavBar from "../NavBar";
import { QueueContext } from "../../contexts/queue.context";
import Queue from "./Queue";

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isAuthLoaded } = useContext(AuthUserContext);
  return (
    <>
      {isAuthLoaded && (
        <div className="text-white flex flex-col h-screen">
          <div className="flex flex-col w-screen">
            <NavBar />
            <Queue />
          </div>
          <div className="flex h-full mx-auto max-w-7xl">{children}</div>
        </div>
      )}
    </>
  );
}
