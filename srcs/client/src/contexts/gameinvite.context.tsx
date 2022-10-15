import React, { useState } from 'react';
interface GameInviteContextInterface {
    gameInvites: GameInv[];
    setGameInvite: (GameInvites: GameInv[]) => void;
}

const GameInviteContextDefaultValues: GameInviteContextInterface = {
  gameInvites:[],
  setGameInvite: () => null,
}

export const GameInviteContext = React.createContext<GameInviteContextInterface>(GameInviteContextDefaultValues);

const GameInviteContextProvider = ({ children }: { children?: React.ReactNode }) => {
    const [gameInvites, setGameInvite] = useState(GameInviteContextDefaultValues.gameInvites);
  return (
    <GameInviteContext.Provider
      value={{
        gameInvites,
        setGameInvite,
      }}
    >
      {children}
    </GameInviteContext.Provider>
  );
};

export default GameInviteContextProvider;
