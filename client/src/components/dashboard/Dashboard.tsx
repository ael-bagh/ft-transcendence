import MainLayout from "../layout/MainLayout";
import { Searching } from "../layout/Loading";
import { useContext, useEffect, useState } from "react";
import { QueueContext } from "../../contexts/queue.context";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/api/useSocket";

export default function Dashboard() {
  const {queue, setQueue} = useContext(QueueContext);
  const {queueUp} = useSocket();
  let navigate = useNavigate();
  const queueUpNormal1 = () => {
    setQueue({
      inQueue: true,
      match: "normal1",
      matchFound: false,
    });
      queueUp().then(()=> {
      setQueue({
        inQueue: true,
        match: "normal1",
        matchFound: true,
      });
    }).catch((err) => {
      console.log("already in queue");}
      );
  };
  return (
    <MainLayout>
      <div className="flex flex-col h-full w-screen m-4 gap-2">
        {!queue.inQueue && (
          <>
            <div
              className="flex flex-row h-20 bg-gray-700 w-full"
              onClick={queueUpNormal1}
            >
              <div className="w-44 h-full bg-purple-500"></div>
              <div className="grow h-full m-auto text-center min-w-44">
                Normal Game 11
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}