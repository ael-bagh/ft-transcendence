import React from "react";
import { AuthUserContext } from "../../contexts/authUser.context";
import NavBar from "../NavBar";
import { useSocket } from "../../hooks/api/useSocket";

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isAuthLoaded } = React.useContext(AuthUserContext);
  return (
    <>
      {isAuthLoaded && (
        <div className="text-white flex flex-col h-screen">
          <NavBar />
          <div className="flex grow w-screen">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
