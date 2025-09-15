// backend/events/connectionHandlers.js
const { nanoid } = require("nanoid");

module.exports = function(io, socket, userDirectory, tempChats) {
  socket.on("join", (requestedUsername, callback) => {
    if (!requestedUsername || requestedUsername.trim() === "") {
      return callback({ success: false, error: "Username cannot be empty." });
    }

    let username = requestedUsername.trim();

    if (userDirectory.isUsernameTaken(username)) {
      const suggestions = [];
      for (let i = 0; i < 3; i++) suggestions.push(`${username}_${nanoid(4)}`);
      return callback({ success: false, error: "Username taken", suggestions });
    }

    const added = userDirectory.addUser(username, socket.id);
    if (!added) return callback({ success: false, error: "Failed to add user." });

    socket.username = username;

    callback({ success: true, username });
    console.log(`User joined: ${username} (${socket.id})`);

    io.emit("userListUpdate", userDirectory.listOnlineUsers());
  });

  socket.on("disconnect", () => {
    const username = userDirectory.removeUserBySocketId(socket.id);
    if (!username) return;

    console.log(`User disconnected: ${username} (${socket.id})`);

    // Notify others that user left the chat room(s)
    // Check all tempChats rooms where this user may be
    tempChats.rooms.forEach((messages, roomId) => {
      const [userA, userB] = roomId.split("-");
      if (userA === username || userB === username) {
        socket.to(roomId).emit("newMessage", {
          sender: "system",
          message: `${username} has disconnected.`,
          type: "system",
          timestamp: Date.now(),
        });
      }
    });

    // Update online user list globally
    io.emit("userListUpdate", userDirectory.listOnlineUsers());
  });
};

