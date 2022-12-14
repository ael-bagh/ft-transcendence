import { useContext, useState, useEffect } from "react";
import { QueueContext } from "../../contexts/queue.context";
import { Searching } from "./Loading";
import { useSocket } from "../../hooks/api/useSocket";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Queue() {
  const [accepted, setAccepted] = useState(false);
  const { queue, setQueue } = useContext(QueueContext);
  const { acceptGame, queueUp, quitQueue } = useSocket();
  let navigate = useNavigate();
  const acceptMatch = () => {
    setAccepted(true);
    acceptGame({ isAccepted: true }).then((data) => {
      setAccepted(false);
      if (data === "refused") {
        setQueue({
          inQueue: true,
          match: queue.match,
          matchFound: false,
        });
        queueUp(queue.match)
          .then(() => {
            setQueue({
              inQueue: true,
              match: queue.match,
              matchFound: true,
            });
          })
          .catch((err) => {
            toast(err, { type: "warning" });
          });
      } else {
        setQueue({
          inQueue: false,
          match: queue.match,
          matchFound: false,
        });
        navigate("/game/" + data);
      }
    });
  };
  const declineMatch = () => {
    acceptGame({ isAccepted: false }).finally(() => {
      setQueue({
        inQueue: false,
        match: "ONE",
        matchFound: false,
      });
    });
  };
  const cancelQueue = () => {
    quitQueue(queue.match).finally(() => {
      setQueue({
        inQueue: false,
        match: "ONE",
        matchFound: false,
      });
    });
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      if (queue.matchFound && accepted === false) {
        declineMatch();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [queue, accepted]);
  return (
    <>
      {queue.inQueue && (
        <div className="flex flex-row h-20 bg-black w-full p-2">
          <div className="flex w-44 h-full bg-black items-center justify-center">
            <Searching />
          </div>
          <div className="flex flex-col justify-center items-center text- grow h-full m-auto text-center min-w-44 bg-gray-700">
            <div>Finding match...</div>
            {!queue.matchFound && (
              <div className="w-1/2 bg-red-500" onClick={cancelQueue}>
                Cancel Queue
              </div>
            )}
            {queue.matchFound && (
              <div className="flex flex-row gap-3 m-2">
                <div className="w-1/2 bg-purple-500" onClick={acceptMatch}>
                  Accept
                </div>
                <div className="w-1/2 bg-black" onClick={declineMatch}>
                  Decline
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
