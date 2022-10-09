import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  redirect
} from "react-router-dom";
import Game from "./routes/Game";
import Profile from "./routes/Profile";
import LeaderBoard from "./routes/LeaderBoard";
import Chat from "./routes/Chat";
import AuthUserProvider from "./contexts/authUser.context";
import  NotificationsProvider  from "./contexts/notifications.context";
import { useContext ,useEffect} from "react";
import { AuthUserContext } from "./contexts/authUser.context";
import useProfile from "./hooks/api/useProfile";
import {ErrorPage, UserNotFound} from "./components/errors/error_page";
import Home from "./components/layout/Home";
import { useSocket } from "./hooks/api/useSocket";
import  axiosInstance from "./lib/axios"
import ProfileEdit from "./components/profile/ProfileEdit";
import Dashboard from "./components/dashboard/Dashboard";
import QueueContextProvider from "./contexts/queue.context";
import ChatRooms from "./components/chat/ChatRooms";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/2fa/login",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/profile/:id",
    element: <Profile />,
    loader: async ({ params }) => {
      return axiosInstance.get("/user/" + params.id)
    },
    errorElement: <UserNotFound />,
  },
  {
    path: "/profile/:id/edit",
    element: <ProfileEdit />,
    loader: async ({ params }) => {
      return axiosInstance.get("/user/" + params.id)
    },
    action: async ({ request }) => {
      const data = Object.fromEntries(await request.formData());
      console.log(data);
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
    loader : async ({ params }) => {
      return axiosInstance.get("/rooms/" + params.id)
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
]);

function App() {
  return (
    <AuthUserProvider>
      <NotificationsProvider>
      <QueueContextProvider>
        <GetAuthuser />
        <RouterProvider router={router}/>
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
  }, [profile])
  return (
    <></>
  );
}

export default App;
