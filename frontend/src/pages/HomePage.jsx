// frontend/src/pages/HomePage.js
import React from "react";
import UserList from "../components/UserList";
import { useSocket } from "../context/SocketContext";
import "./HomePage.css";

export default function HomePage() {
  const { username } = useSocket();

  return (
    <div className="home-page">
      <h2>Welcome, {username} 👋</h2> 
      <UserList />
    </div>
  );
}
