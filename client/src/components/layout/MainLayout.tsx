import React, { useContext, useEffect } from "react";
import { AuthUserContext } from "../../contexts/authUser.context";
import NavBar from "../NavBar/NavBar";
import Queue from "./Queue";

import sock from "../../lib/socket";
import { GameInviteContext } from "../../contexts/gameinvite.context";
import { useNavigate } from "react-router-dom";
import { QueueContext } from "../../contexts/queue.context";

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
            <NavBar />
            <Queue />
            <GameEventsComponent />
          </div>
          <div className="flex h-full">{children}</div>
        </div>
      )}
    </>
  );
}

function GameEventsComponent() {
  const navigate = useNavigate();
  const { isAuthLoaded, authUser } = useContext(AuthUserContext);
  const { setQueue } = useContext(QueueContext);
  const { gameInvites, setGameInvite } = useContext(GameInviteContext);

  useEffect(() => {
    if (isAuthLoaded && authUser?.status === "INQUEUE") {
      setQueue({
        inQueue: true,
        match: "NORMAL",
        matchFound: false,
      });
    }
    sock.on("queue_quitted", () => {
      setQueue({
        inQueue: false,
        match: "ONE",
        matchFound: false,
      });
    });
    sock.on("join_queue", (data: any) => {
      setQueue({
        inQueue: true,
        match: data,
        matchFound: false,
      });
    });
    sock.on("game_request", (data) => {
      setGameInvite([
        ...gameInvites,
        {
          roomId: data.roomId,
          target_login: data.target_login,
          mode: data.mode,
        },
      ]);
    });
    sock.on("game_accepted", (data) => {
      setGameInvite(
        gameInvites.filter((game) => game.target_login !== data.target_login)
      );
      setQueue({ inQueue: false, match: "ONE", matchFound: false });
      if (data !== "refused") navigate("/game/" + data);
    });

    return () => {
      sock.off("game_request");
    };
  }, []);

  return <></>;
}
