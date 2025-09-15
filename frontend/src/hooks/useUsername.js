// frontend/src/hooks/useUsername.js
import { useState, useEffect } from 'react';

export default function useUsername() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
  }, [username]);

  return [username, setUsername];
}
