import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Game from "./routes/Game";
import Profile from "./routes/Profile";
import LeaderBoard from "./routes/LeaderBoard";
import Chat from "./routes/Chat";
import AuthUserProvider from "./contexts/authUser.context";
import { useContext ,useEffect} from "react";
import { AuthUserContext } from "./contexts/authUser.context";
import useProfile from "./hooks/api/useProfile";
import {ErrorPage, UserNotFound} from "./components/errors/error_page";
import { Flowbite } from "flowbite-react";
import Home from "./components/layout/Home";
import { useSocket } from "./hooks/api/useSocket";
import  axiosInstance from "./lib/axios"
import { ChatContext } from "./contexts/chat.context";
import ProfileEdit from "./components/profile/ProfileEdit";

const router = createBrowserRouter([
  {
    path: "/",
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
    action: async ({ request, params }) => {
      const data = Object.fromEntries(await request.formData());
      console.log(data);
      await axiosInstance.patch("/user/update", data);
      return { redirect: "/profile/" + params.id };
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
]);

function App() {
  return (
    <AuthUserProvider>
      <Flowbite>
        <GetAuthuser />
        <RouterProvider router={router}/>
      </Flowbite>
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
