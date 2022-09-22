import React from "react";
import "./App.css";
import Header from "./components/Header";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import { BrowserRouter, Routes} from "react-router-dom";
import Profile from "./routes/Profile";
import LeaderBoard from "./routes/LeaderBoard";
import Chat from "./routes/Chat";
import AuthUserProvider from "./contexts/authUser.context";
import { useContext ,useEffect} from "react";
import { AuthUserContext } from "./contexts/authUser.context";
import useProfile from "./hooks/api/useProfile";
import ErrorPage from "./components/errors/error_page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Header />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/profile/:id",
    element: <Profile />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/chat",
    element: <Chat />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/leaderboard/:page",
    element: <LeaderBoard />,
    errorElement: <ErrorPage />,
  },
]);

function App() {
  return (
    <AuthUserProvider>
      <GetAuthuser />
      <RouterProvider router={router}/>
    </AuthUserProvider>
  );
}

function GetAuthuser() {
  const { authUser, setAuthUser } = useContext(AuthUserContext);
  const { profile, error } = useProfile();
  useEffect(() => {  
    if (!authUser) {
      if (profile) {
        console.log(profile);
        setAuthUser(profile);
      }
    }
  }, [profile])
  return (
    <></>
  );
}

export default App;
