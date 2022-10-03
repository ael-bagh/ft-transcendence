import MainLayout from "../layout/MainLayout";
import { Searching } from "../layout/Loading";
import { useContext, useEffect, useState } from "react";
import { QueueContext } from "../../contexts/queue.context";
export default function Dashboard() {
  const {queue, setQueue} = useContext(QueueContext);

  const queueUpNormal1 = () => {
    //queue up here
    setQueue({
      inQueue: true,
      match: "normal1",
    });
  };
  const queueUpNormal2 = () => {
    //queue up here
    setQueue({
      inQueue: true,
      match: "normal2",
      });
  };
  const queueUpRanked = () => {
    //queue up here
    setQueue({
      inQueue: true,
      match: "ranked",
    });
  };
  return (
    <MainLayout>
      <div className="flex flex-col h-full w-screen m-4 gap-2">
        {!queue.inQueue && (
          <>
            <div
              className="flex flex-row h-20 bg-gray-700 w-full"
              onClick={queueUpRanked}
            >
              <div className="w-44 h-full bg-purple-500"></div>
              <div className="grow h-full m-auto text-center min-w-44">
                Normal Game 11
              </div>
            </div>
            <div
              className="flex flex-row h-20 bg-gray-700 w-full"
              onClick={queueUpNormal2}
            >
              <div className="w-44 h-full bg-purple-500"></div>
              <div className="grow h-full m-auto text-center min-w-44">
                Normal Game 7
              </div>
            </div>
            <div
              className="flex flex-row h-20 bg-gray-700 w-full"
              onClick={queueUpNormal1}
            >
              <div className="w-44 h-full bg-purple-500"></div>
              <div className="grow h-full m-auto text-center min-w-44">
                Ranked Game
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
