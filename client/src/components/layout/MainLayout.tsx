import React from "react";
import NavBar from "../NavBar";

export default function MainLayout ({children} : {children?: React.ReactNode}){
    return (
     <div className="text-white h-screen">
      <NavBar />
      <div className="flex flex-col md:flex-row h-screen w-screen border-t-2 border-gray-300">
        {children}
      </div>
    </div>
    )
}
