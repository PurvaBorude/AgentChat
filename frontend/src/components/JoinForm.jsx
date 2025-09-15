import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import './JoinForm.css';

export default function JoinForm() {
  const { joinServer, username, usernameSuggestions } = useSocket();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If already joined, redirect straight to home
  useEffect(() => {
    if (username) {
      navigate('/home');
    }
  }, [username, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!input.trim()) {
      setError('Username cannot be empty');
      return;
    }
    setLoading(true);

    joinServer(input.trim(), (res) => {
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Join failed');
      } else {
        // ✅ On success, navigate to Home
        navigate('/home');
      }
    });
  };

  return (
    <div className="join-form-container">
      <h1><i>Welcome To AgentChat! Connect with Friends</i></h1>
      <h2>Enter your username</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Joining...' : 'Join'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {usernameSuggestions.length > 0 && (
        <div className="suggestions">
          <p>Username taken. Try one of these:</p>
          <ul className='suggestion-list'>
            {usernameSuggestions.map((suggestion) => (
              <li className='names' key={suggestion}>
                <button className='suggestion-button'
                  onClick={() => {
                    setInput(suggestion);
                    setError('');
                  }}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
