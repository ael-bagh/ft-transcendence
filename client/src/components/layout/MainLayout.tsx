import React, { useContext } from "react";
import { AuthUserContext } from "../../contexts/authUser.context";
import NavBar from "../NavBar/NavBar";
import Queue from "./Queue";
import GameInvite from "./GameInvite";
import { ToastContainer } from 'react-toastify';

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isAuthLoaded, authUser } = useContext(AuthUserContext);
  return (
    <>
      {isAuthLoaded && authUser && (
        <div className="text-white flex flex-col h-screen">
          <div className="flex flex-col w-screen">
          <ToastContainer />
            <NavBar />
            <Queue />
            <GameInvite />
          </div>
          <div className="flex h-full">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
