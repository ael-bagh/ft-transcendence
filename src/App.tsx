import React from 'react';
import './App.css';
import Header from './components/Header'
import { BrowserRouter,
  Routes,
  Route,} from "react-router-dom";
import Profile from './routes/Profile';
import LeaderBoard from './routes/LeaderBoard';
import Chat from './routes/Chat';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="profile" element={<Profile />} />
        <Route path="leaderboard" element={<LeaderBoard />} />
        <Route path="chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
