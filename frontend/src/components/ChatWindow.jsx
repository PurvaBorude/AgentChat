// frontend/src/components/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import "./ChatWindow.css";

export default function ChatWindow() {
  const {
    socket,
    username,
    chatRoomId,
    messages,
    setMessages,
    sendMessage,
    joinRoom,
    leaveRoom,
    typingUsers,
    emitTyping,
    emitStopTyping,
  } = useSocket();

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const messagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Join room & fetch history
  useEffect(() => {
    if (!socket || !chatRoomId) return;

    joinRoom(chatRoomId, (res) => {
      if (!res.success) alert(res.error || "Failed to join room");
    });

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m.timestamp === msg.timestamp && m.sender === msg.sender
        );
        if (exists) return prev;
        return [...prev, msg];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, chatRoomId, joinRoom, setMessages]);

  // Auto-scroll
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(chatRoomId, input.trim(), (res) => {
      if (!res.success) alert(res.error || "Message failed");
    });
    setInput("");
  };

  // Typing indicator
  const handleTyping = (e) => {
    setInput(e.target.value);
    emitTyping(chatRoomId);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitStopTyping(chatRoomId), 1000);
  };

  // Leave room
  const handleLeave = () => {
    leaveRoom();
    navigate("/home");
  };

  // File change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // File upload/share
  const handleFileUpload = () => {
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileMessage = {
      sender: username,
      type: "file",
      fileName: file.name,
      fileUrl,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, fileMessage]);

    // Notify other participant
    socket.emit("newFileMessage", { roomId: chatRoomId, ...fileMessage });

    setFile(null);
  };

  return (
    <div className="chat-window">
      <h3>Chat Room: {chatRoomId}</h3>

      <div
        ref={messagesRef}
        className="messages"
        style={{ maxHeight: 400, overflowY: "auto" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.sender === username
                ? "my-message"
                : msg.type === "system"
                ? "system-message"
                : "other-message"
            }
          >
            {msg.type === "file" ? (
              <>
                <strong>{msg.sender}: </strong>
                <a href={msg.fileUrl} download={msg.fileName} target="_blank" rel="noopener noreferrer">
                  📎 {msg.fileName}
                </a>
              </>
            ) : (
              <span>
                {msg.sender !== "system" && <strong>{msg.sender}: </strong>}
                {msg.message}
              </span>
            )}
          </div>
        ))}
      </div>

      <div>
        {Array.from(typingUsers)
          .filter((u) => u !== username)
          .join(", ")}
        {typingUsers.size > 0 && " is typing..."}
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input type="text" value={input} onChange={handleTyping} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>

      {/* File Upload */}
      <div style={{ marginTop: "10px" }}>
        <input type="file" className="chat-file-input" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={!file}>
          Share File
        </button>
      </div>

      <button onClick={handleLeave} style={{ marginTop: "10px" }}>
        Leave Room
      </button>
    </div>
  );
}
