// frontend/src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  // Persist username & chatRoomId in localStorage
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [chatRoomId, setChatRoomId] = useState(() => localStorage.getItem("chatRoomId") || null);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [invites, setInvites] = useState({});
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);

  const socketRef = useRef();

  // Initialize socket
  useEffect(() => {
  const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
    autoConnect: false,
    transports: ["websocket"], // ensures it works on Render
  });
  socketRef.current = newSocket;
  setSocket(newSocket);

  return () => newSocket.disconnect();
}, []);



  // Core socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("userListUpdate", (users) => setOnlineUsers(users));

    socket.on("receiveInvite", ({ fromUsername }) =>
      setInvites((prev) => ({ ...prev, [fromUsername]: "received" }))
    );
    socket.on("inviteWithdrawn", ({ byUsername }) =>
      setInvites((prev) => {
        const copy = { ...prev };
        delete copy[byUsername];
        return copy;
      })
    );
    socket.on("inviteAccepted", ({ roomId, byUsername }) => {
      setChatRoomId(roomId);
      localStorage.setItem("chatRoomId", roomId);
      setInvites((prev) => ({ ...prev, [byUsername]: "connected" }));
      fetchHistory(roomId);
    });
    socket.on("inviteRejected", ({ byUsername }) => {
      setInvites((prev) => {
        const copy = { ...prev };
        delete copy[byUsername];
        return copy;
      });
      alert(`${byUsername} rejected your invite.`);
    });

    socket.on("newMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("typing", ({ username }) =>
      setTypingUsers((prev) => new Set(prev).add(username))
    );
    socket.on("stopTyping", ({ username }) => {
      setTypingUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(username);
        return copy;
      });
    });

    return () => {
      socket.off("userListUpdate");
      socket.off("receiveInvite");
      socket.off("inviteWithdrawn");
      socket.off("inviteAccepted");
      socket.off("inviteRejected");
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket]);

  // Auto-rejoin server + room on refresh
  useEffect(() => {
    if (!socket) return;
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      socket.connect();
      socket.emit("join", storedUsername, (res) => {
        if (res.success) {
          setUsername(res.username);
        } else {
          console.warn("Failed to auto-join:", res.error);
          localStorage.removeItem("username");
          setUsername("");
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket && chatRoomId) {
      socket.connect();
      socket.emit("joinRoom", chatRoomId, (res) => {
        if (!res.success) console.warn(res.error);
        fetchHistory(chatRoomId);
      });
    }
  }, [socket, chatRoomId]);

  // --- Actions ---

  function joinServer(requestedUsername, callback = () => {}) {
    if (!socket) return;
    socket.connect();
    socket.emit("join", requestedUsername, (res) => {
      if (res.success) {
        setUsername(res.username);
        localStorage.setItem("username", res.username); // persist
        setUsernameSuggestions([]);
      } else if (res.error === "Username taken" && res.suggestions) {
        setUsernameSuggestions(res.suggestions);
      } else {
        alert(res.error || "Join failed");
      }
      callback(res);
    });
  }

  function sendInvite(toUsername, callback = () => {}) {
    socket.emit("sendInvite", { toUsername }, callback);
    setInvites((prev) => ({ ...prev, [toUsername]: "pending" }));
  }

  function withdrawInvite(toUsername, callback = () => {}) {
    socket.emit("withdrawInvite", { toUsername }, callback);
    setInvites((prev) => {
      const copy = { ...prev };
      delete copy[toUsername];
      return copy;
    });
  }

  function acceptInvite(fromUsername, callback = () => {}) {
    socket.emit("acceptInvite", { fromUsername }, callback);
    setInvites((prev) => ({ ...prev, [fromUsername]: "connected" }));
  }

  function rejectInvite(fromUsername, callback = () => {}) {
    socket.emit("rejectInvite", { fromUsername }, callback);
    setInvites((prev) => {
      const copy = { ...prev };
      delete copy[fromUsername];
      return copy;
    });
  }

  function joinRoom(roomId, callback = () => {}) {
    socket.emit("joinRoom", roomId, callback);
  }

  function sendMessage(roomId, message, callback = () => {}) {
    socket.emit("sendMessage", { roomId, message }, callback);
  }

  function fetchHistory(roomId, callback = () => {}) {
    socket.emit("getHistory", roomId, (res) => {
      if (res.success) setMessages(res.messages);
      callback(res);
    });
  }

  function emitTyping(roomId) {
    socket.emit("typing", roomId);
  }

  function emitStopTyping(roomId) {
    socket.emit("stopTyping", roomId);
  }

  function leaveRoom() {
    if (!socket || !chatRoomId) return;
    socket.emit("leaveRoom", chatRoomId, () => {});
    setChatRoomId(null);
    localStorage.removeItem("chatRoomId");
    setMessages([]);
  }

  // Optional: clear all session (like logout)
  function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("chatRoomId");
    setUsername("");
    setChatRoomId(null);
    setMessages([]);
    setInvites({});
    socket?.disconnect();
  }

  const value = {
    socket,
    username,
    joinServer,
    usernameSuggestions,
    onlineUsers,
    invites,
    sendInvite,
    withdrawInvite,
    acceptInvite,
    rejectInvite,
    chatRoomId,
    setChatRoomId,
    messages,
    setMessages,
    joinRoom,
    sendMessage,
    fetchHistory,
    typingUsers,
    emitTyping,
    emitStopTyping,
    leaveRoom,
    logout,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
