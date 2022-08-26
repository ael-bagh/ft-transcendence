import React from 'react';
import './App.css';
import Header from './components/Header'
import { BrowserRouter,
  Routes,
  Route,} from "react-router-dom";
import Profile from './routes/Profile';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
