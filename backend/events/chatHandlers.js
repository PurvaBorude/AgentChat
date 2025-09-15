// backend/events/chatHandlers.js
const session = require("../utils/sessionManager");

// NOTE: roomUsers and per-room present-members tracking is module-level so it's shared across sockets.
const roomUsers = new Map(); // roomId -> Set of usernames currently joined (by joinRoom)

module.exports = function (io, socket, userDirectory, tempChats) {
  // Join room
  socket.on("joinRoom", (roomId, callback) => {
    if (!roomId) return callback({ success: false, error: "No roomId provided." });
    if (!socket.username) return callback({ success: false, error: "Unauthenticated socket." });

    socket.join(roomId);

    if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
    const users = roomUsers.get(roomId);

    // Addition of this username if not already present
    if (!users.has(socket.username)) {
      users.add(socket.username);
      // notify others in room (only once per username add)
      socket.to(roomId).emit("newMessage", {
        sender: "system",
        message: `${socket.username} has joined the room.`,
        type: "system",
        timestamp: Date.now(),
      });
    }

    // Return success
    callback({ success: true });
  });

  // Leave room (explicit leave via UI)
  socket.on("leaveRoom", (roomId, callback = () => {}) => {
    if (!roomId) return callback({ success: false, error: "No roomId." });
    socket.leave(roomId);

    // Remove from present-members
    if (roomUsers.has(roomId)) {
      const users = roomUsers.get(roomId);
      if (users.has(socket.username)) {
        users.delete(socket.username);
        socket.to(roomId).emit("newMessage", {
          sender: "system",
          message: `${socket.username} has left the room.`,
          type: "system",
          timestamp: Date.now(),
        });
      }
      // If room is now empty => explicit leave by last user -> delete chat history
      if (users.size === 0) {
        roomUsers.delete(roomId);
        // delete chat history permanently (requirement)
        tempChats.deleteRoom(roomId);
        // Also remove any logical connections that pointed to this room
        // iterate over session.connections and remove ones pointing to roomId
        for (const [uname, rId] of Array.from(session.connections.entries())) {
          if (rId === roomId) session.removeConnection(uname);
        }
      } else {
        // if other users still in room, just remove this user's logical connection
        session.removeConnection(socket.username);
      }
    } else {
      // Not present: still remove logical connection if any
      session.removeConnection(socket.username);
    }

    // Broadcast updated lists
    io.emit("userListUpdate", userDirectory.listOnlineUsers());
    io.emit("statusUpdate", session.snapshot());

    callback({ success: true });
  });

  // Send text message
  socket.on("sendMessage", ({ roomId, message }, callback) => {
    if (!roomId || !message) return callback({ success: false, error: "Invalid message data." });

    const messageObj = {
      sender: socket.username,
      message,
      timestamp: Date.now(),
    };

    tempChats.addMessage(roomId, messageObj);
    io.to(roomId).emit("newMessage", messageObj);
    callback({ success: true });
  });

  // File messages (frontend uses this to share a file message after upload)
  socket.on(
    "newFileMessage",
    ({ roomId, sender, fileUrl, fileName, fileType }, callback = () => {}) => {
      if (!roomId || !fileUrl) return callback({ success: false, error: "Invalid file message data." });

      const fileMessage = {
        sender: sender || socket.username,
        type: "file",
        fileUrl,
        fileName,
        fileType,
        timestamp: Date.now(),
      };

      tempChats.addMessage(roomId, fileMessage);
      io.to(roomId).emit("newMessage", fileMessage);
      callback({ success: true });
    }
  );

  // Typing indicators
  socket.on("typing", (roomId) => socket.to(roomId).emit("typing", { username: socket.username }));
  socket.on("stopTyping", (roomId) => socket.to(roomId).emit("stopTyping", { username: socket.username }));
};
