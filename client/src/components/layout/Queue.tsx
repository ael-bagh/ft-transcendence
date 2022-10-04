import { useContext, useState, useEffect } from "react"
import { QueueContext } from "../../contexts/queue.context"
import { Searching } from "./Loading";
import { useSocket } from "../../hooks/api/useSocket";
import { useNavigate } from "react-router-dom";

export default function Queue() {
    const { queue, setQueue } = useContext(QueueContext)
    const {acceptGame} = useSocket();
    const acceptMatch = () => {
      let navigate = useNavigate();
      acceptGame({isAccepted:true}).then((data) => {
      setQueue({
        inQueue: false,
        match: null,
        matchFound: true,
      });
      navigate("/game/"+data);
    }).catch(() => {
      setQueue({
        inQueue: true,
        match: null,
        matchFound: false,
        });
    })
    }
    const declineMatch = () => {
      acceptGame({isAccepted:false}).then((data) => {
      setQueue({
        inQueue: false,
        match: null,
        matchFound: false,
      });
    })};
    const cancelQueue = () => {
        //cancel queue here
        setQueue({
          inQueue: false,
          match: null,
          matchFound: false,
        });
      };
      useEffect(() => {
        //check if match found here
        
      }, [queue]);
    return (<>{queue.inQueue && (
        <div className="flex flex-row h-20 bg-black w-full m-2 p-2">
          <div className="flex w-44 h-full bg-black items-center justify-center">
            <Searching />
          </div>
          <div className="flex flex-col justify-center items-center text- grow h-full m-auto text-center min-w-44 bg-gray-700">
            <div>Finding match...</div>
            {!queue.matchFound && (
              <div className="w-1/2 bg-red-500" onClick={cancelQueue}>Cancel Queue</div>
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
      )}</>)
}