import MainLayout from "../layout/MainLayout";
import { Searching } from "../layout/Loading";
import { useContext, useEffect, useState } from "react";
import { QueueContext } from "../../contexts/queue.context";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/api/useSocket";

export default function Dashboard() {
  const { queue, setQueue } = useContext(QueueContext);
  const { queueUp } = useSocket();
  let navigate = useNavigate();
  const queueUpByMode = (mode: "ONE" | "NORMAL" | "RANKED") => {
    setQueue({
      inQueue: true,
      match: mode,
      matchFound: false,
    });
    queueUp(mode)
      .then(() => {
        setQueue({
          inQueue: true,
          match: mode,
          matchFound: true,
        });
      })
      .catch((err) => console.log("already in queue"));
  };
  return (
    <MainLayout>
      <div className="flex flex-col h-full w-screen m-4 gap-2">
        {!queue.inQueue && (
          <>
            <div
              className="flex flex-row h-20 bg-gray-700 w-full"
              onClick={() => queueUpByMode("ONE")}
            >
              <div className="w-44 h-full bg-purple-500"></div>
              <div className="grow h-full m-auto text-center min-w-44">
                ONE: single Match
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col h-full w-screen m-4 gap-2">
        {!queue.inQueue && (
          <>
            <div
              className="flex flex-row h-20 bg-gray-700 w-full"
              onClick={() => queueUpByMode("NORMAL")}
            >
              <div className="w-44 h-full bg-purple-500"></div>
              <div className="grow h-full m-auto text-center min-w-44">
                NORMAL : Best of 3
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col h-full w-screen m-4 gap-2">
        {!queue.inQueue && (
          <>
            <div
              className="flex flex-row h-20 bg-gray-700 w-full"
              onClick={() => queueUpByMode("RANKED")}
            >
              <div className="w-44 h-full bg-purple-500"></div>
              <div className="grow h-full m-auto text-center min-w-44">
                RANKED : Best of 3
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
