// frontend/src/components/UserList.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import "./UserList.css";

export default function UserList() {
  const navigate = useNavigate();
  const {
    onlineUsers,
    username,
    invites,
    sendInvite,
    withdrawInvite,
    acceptInvite,
    rejectInvite,
    chatRoomId,
  } = useSocket();

  // Navigate to chat if chatRoomId exists (refresh persistence)
  useEffect(() => {
    if (chatRoomId) {
      navigate("/chat");
    }
  }, [chatRoomId, navigate]);

  const handleAccept = (fromUser) => {
    acceptInvite(fromUser, (res) => {
      if (!res.success) alert(res.error || "Failed to accept invite");
    });
  };

  const handleReject = (fromUser) => {
    rejectInvite(fromUser, (res) => {
      if (!res.success) alert(res.error || "Failed to reject invite");
    });
  };

  const handleSend = (toUser) => {
    sendInvite(toUser, (res) => {
      if (!res.success) alert(res.error || "Failed to send invite");
    });
  };

  const handleWithdraw = (toUser) => {
    withdrawInvite(toUser, (res) => {
      if (!res.success) alert(res.error || "Failed to withdraw invite");
    });
  };

  return (
    <div className="user-list">
      <h3>Online Users</h3>
      <ul>
        {onlineUsers
          .filter((u) => u !== username)
          .map((user) => {
            const status = invites[user]; // "pending" | "received" | "connected"
            return (
              <li key={user}>
                <span>{user}</span>
                <div className="actions">
                  {status === "received" ? (
                    <>
                      <button onClick={() => handleAccept(user)}>Accept</button>
                      <button onClick={() => handleReject(user)}>Reject</button>
                    </>
                  ) : status === "pending" ? (
                    <button onClick={() => handleWithdraw(user)}>Withdraw</button>
                  ) : status === "connected" ? (
                    <span>Connected</span>
                  ) : (
                    <button onClick={() => handleSend(user)}>Invite</button>
                  )}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
