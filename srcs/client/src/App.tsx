import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import Game from "./routes/Game";
import Profile from "./routes/Profile";
import LeaderBoard from "./routes/LeaderBoard";
import Chat from "./routes/Chat";
import AuthUserProvider from "./contexts/authUser.context";
import NotificationsProvider from "./contexts/notifications.context";
import { useContext, useEffect } from "react";
import { AuthUserContext } from "./contexts/authUser.context";
import useProfile from "./hooks/api/useProfile";
import { ErrorPage, UserNotFound } from "./components/errors/error_page";
import Home from "./components/layout/Home";
import { useSocket } from "./hooks/api/useSocket";
import axiosInstance from "./lib/axios";
import ProfileEdit from "./components/profile/ProfileEdit";
import Dashboard from "./components/dashboard/Dashboard";
import QueueContextProvider from "./contexts/queue.context";
import ChatRooms from "./components/chat/ChatRooms";
import RoomCreate from "./components/chat/RoomCreate";
import RoomManagement from "./components/chat/RoomManagement";
import ProfileByLogin from "./routes/ProfileByLogin";
import TwoFactorAuth from "./components/2FA/TwoFactorAuth";

import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/2fa/:login",
    element: <TwoFactorAuth />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/profile/me",
    element: <Profile />,
    errorElement: <UserNotFound />,
  },
  {
    path: "/profile/:id",
    element: <ProfileByLogin />,
    loader: async ({ params }) => {
      return axiosInstance.get("/user/" + params.id);
    },
    errorElement: <UserNotFound />,
  },
  {
    path: "/profile/edit",
    element: <ProfileEdit />,
    action: async ({ request }) => {
      const data = Object.fromEntries(await request.formData());
      const user = await axiosInstance.patch("/user/update", data);
      return redirect(`/profile/${user.data.user_id}`);
    },
    errorElement: <UserNotFound />,
  },
  {
    path: "/chat",
    element: <Chat />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/chat/:id",
    element: <Chat />,
    loader: async ({ params }) => {
      return axiosInstance.get("/rooms/" + params.id);
    },
    errorElement: <ErrorPage />,
  },

  {
    path: "/leaderboard/:page",
    element: <LeaderBoard />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/game/:id",
    // loader : async ({params}) => {
    //   return axiosInstance.get("/game/" + params.id)
    // },
    element: <Game />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/Dashboard",
    element: <Dashboard />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/rooms",
    element: <ChatRooms />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/rooms/create",
    element: <RoomCreate />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/rooms/:id/edit",
    element: <RoomManagement />,
    errorElement: <ErrorPage />,
  },
]);

function App() {
  return (
    <AuthUserProvider>
      <NotificationsProvider>
        <QueueContextProvider>
          <GetAuthuser />
          <RouterProvider router={router} />
          <ToastContainer />
        </QueueContextProvider>
      </NotificationsProvider>
    </AuthUserProvider>
  );
}

function GetAuthuser() {
  const { authUser, setAuthUser } = useContext(AuthUserContext);
  const { profile } = useProfile();
  useSocket();

  useEffect(() => {
    if (!authUser) {
      if (profile) {
        setAuthUser(profile);
      }
    }
  }, [profile]);
  return <></>;
}

export default App;
