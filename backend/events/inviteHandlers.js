// backend/events/inviteHandlers.js
const session = require("../utils/sessionManager");

module.exports = function (io, socket, userDirectory, tempChats) {
  // helper to broadcast current user list + status snapshot
  function broadcastStatus() {
    io.emit("userListUpdate", userDirectory.listOnlineUsers());
    io.emit("statusUpdate", session.snapshot());
  }

  // Send invite
  socket.on("sendInvite", ({ toUsername }, callback = () => {}) => {
    const fromUsername = socket.username;
    if (!fromUsername) return callback({ success: false, error: "Sender unknown." });
    if (!toUsername) return callback({ success: false, error: "Recipient missing." });

    const toSocketId = userDirectory.getSocketId(toUsername);
    if (!toSocketId) return callback({ success: false, error: "User not online." });

    // Prevent inviting someone already connected
    const toRoom = session.getConnectionRoom(toUsername);
    const fromRoom = session.getConnectionRoom(fromUsername);
    if (toRoom || fromRoom) {
      return callback({ success: false, error: "Either you or recipient is already connected." });
    }

    // Prevent duplicate invites
    const existing = session.getInviteTo(fromUsername);
    if (existing) return callback({ success: false, error: "Invite already sent." });

    // Add pending invite and notify recipient
    session.addInvite(fromUsername, toUsername);
    io.to(toSocketId).emit("receiveInvite", { fromUsername: fromUsername });
    broadcastStatus();
    callback({ success: true });
  });

  // Withdraw invite
  socket.on("withdrawInvite", ({ toUsername }, callback = () => {}) => {
    const fromUsername = socket.username;
    if (!fromUsername || !toUsername) return callback({ success: false, error: "Invalid data." });

    // Only withdraw if a pending invite exists from this user
    const pendingTo = session.getInviteTo(fromUsername);
    if (pendingTo && pendingTo === toUsername) {
      session.removeInvite(fromUsername);
      const toSocketId = userDirectory.getSocketId(toUsername);
      if (toSocketId) io.to(toSocketId).emit("inviteWithdrawn", { byUsername: fromUsername });
      broadcastStatus();
    }
    callback({ success: true });
  });

  // Reject invite
  socket.on("rejectInvite", ({ fromUsername }, callback = () => {}) => {
    if (!fromUsername) return callback({ success: false, error: "Invalid data." });
    // remove pending invite (if exists)
    const pendingTo = session.getInviteTo(fromUsername);
    if (pendingTo) session.removeInvite(fromUsername);

    const fromSocketId = userDirectory.getSocketId(fromUsername);
    if (fromSocketId) {
      io.to(fromSocketId).emit("inviteRejected", { byUsername: socket.username });
    }
    broadcastStatus();
    callback({ success: true });
  });

  // Accept invite -> create logical connection and room
  socket.on("acceptInvite", ({ fromUsername }, callback = () => {}) => {
    const toUsername = socket.username;
    if (!fromUsername || !toUsername) return callback({ success: false, error: "Invalid data." });

    const fromSocketId = userDirectory.getSocketId(fromUsername);
    if (!fromSocketId) return callback({ success: false, error: "Inviter is offline." });

    // Prevent accepting if already connected
    if (session.getConnectionRoom(fromUsername) || session.getConnectionRoom(toUsername)) {
      return callback({ success: false, error: "Either user is already connected." });
    }

    // Create consistent roomId (sorted usernames)
    const users = [fromUsername, toUsername].sort();
    const roomId = users.join("-");

    // Create temp chat room (messages kept until explicit deletion on last leave)
    tempChats.createRoom(roomId);

    // Mark both as connected to this room (logical connection)
    session.addConnection(fromUsername, roomId);
    session.addConnection(toUsername, roomId);

    // Remove any pending invite entries that involved them
    session.removeInvitesInvolving(fromUsername);
    session.removeInvitesInvolving(toUsername);

    // Notify both clients
    io.to(fromSocketId).emit("inviteAccepted", { roomId, byUsername: toUsername });
    socket.emit("inviteAccepted", { roomId, byUsername: toUsername });

    broadcastStatus();
    callback({ success: true, roomId });
  });
};
