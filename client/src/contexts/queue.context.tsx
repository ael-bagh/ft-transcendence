import React, { useState } from 'react';

interface Q {
    inQueue: boolean;
    match: "ONE" | "NORMAL" | "RANKED";
    matchFound: boolean;
}
interface QueueContextInterface {
    queue: Q;
    setQueue: (queue: Q) => void;
}

const QueueContextDefaultValues: QueueContextInterface = {
  queue: {
    inQueue: false,
    match: 'ONE',
    matchFound: false,
    },
  setQueue: () => null,
}

export const QueueContext = React.createContext<QueueContextInterface>(QueueContextDefaultValues);

const QueueContextProvider = ({ children }: { children?: React.ReactNode }) => {
    const [queue, setQueue] = useState(QueueContextDefaultValues.queue);
  return (
    <QueueContext.Provider
      value={{
        queue,
        setQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export default QueueContextProvider;
