// frontend/src/App.jsx
/*import React from 'react';
import { useSocket } from './context/SocketContext';
import JoinForm from './components/JoinForm';
import UserList from './components/UserList';
import InviteModal from './components/InviteModal';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const { username } = useSocket();

  return (
    <div className="app-container">
      {!username ? (
        <JoinForm />
      ) : (
        <>
          <h1>Welcome, {username}</h1>
          <div className="main-content">
            <UserList />
            <ChatWindow />
          </div>
          <InviteModal />
        </>
      )}
    </div>
  );
}*/


// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
