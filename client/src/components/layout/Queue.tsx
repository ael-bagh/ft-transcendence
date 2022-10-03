import { useContext, useState, useEffect } from "react"
import { QueueContext } from "../../contexts/queue.context"
import { Searching } from "./Loading";

export default function Queue() {
    const { queue, setQueue } = useContext(QueueContext)
    const [matchFound, setMatchFound] = useState(false);
    const acceptMatch = () => {
      //accept match here
      //setMatchFound(false);
      setQueue({
        inQueue: false,
        match: null,
      });
      //redirect to game
    };
    const declineMatch = () => {
      //decline match here
      setMatchFound(false);
      setQueue({
        inQueue: false,
        match: null,
      });
    };
    const cancelQueue = () => {
        //cancel queue here
        setQueue({
          inQueue: false,
          match: null,
        });
      };
      useEffect(() => {
        //check if match found here
        setMatchFound(false);
      }, [queue]);
    return (<>{queue.inQueue && (
        <div className="flex flex-row h-20 bg-gray-700 w-full m-2 p-2">
          <div className="flex w-44 h-full bg-black items-center justify-center">
            <Searching />
          </div>
          <div className="flex flex-col justify-center items-center grow h-full m-auto text-center min-w-44">
            <div>Finding match...</div>
            {!matchFound && (
              <div className="w-1/2 bg-red-500" onClick={cancelQueue}>Cancel Queue</div>
            )}
            {matchFound && (
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