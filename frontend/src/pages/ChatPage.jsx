// frontend/src/pages/ChatPage.js
import React from "react";
import { useSocket } from "../context/SocketContext";
import ChatWindow from "../components/ChatWindow";
import "./ChatPage.css";

export default function ChatPage() {
  const { chatRoomId, username } = useSocket();

  if (!chatRoomId) {
    return (
      <div className="chat-page">
        <h3>No chat room joined yet.</h3>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/*<h2>Chat Room: {chatRoomId}</h2>*/}
      <ChatWindow username={username} roomId={chatRoomId} />
    </div>
  );
}
