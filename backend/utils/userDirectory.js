// backend/utils/userDirectory.js
// Maintains username <-> socketId maps for quick lookups and safe replace of stale sockets.

class UserDirectory {
  constructor() {
    this.usernameToSocket = new Map(); // username -> socketId
    this.socketToUsername = new Map(); // socketId -> username
  }

  // Add a new user if username not taken. Returns true on success.
  addUser(username, socketId) {
    if (this.usernameToSocket.has(username)) return false;
    this.usernameToSocket.set(username, socketId);
    this.socketToUsername.set(socketId, username);
    return true;
  }

  // Force-set username to socketId (used when replacing a stale socket).
  setOrReplaceUser(username, socketId) {
    const oldSocket = this.usernameToSocket.get(username);
    if (oldSocket) this.socketToUsername.delete(oldSocket);
    this.usernameToSocket.set(username, socketId);
    this.socketToUsername.set(socketId, username);
    return true;
  }

  removeUserBySocketId(socketId) {
    const username = this.socketToUsername.get(socketId);
    if (!username) return null;
    this.socketToUsername.delete(socketId);
    this.usernameToSocket.delete(username);
    return username;
  }

  getSocketId(username) {
    return this.usernameToSocket.get(username) || null;
  }

  getUsernameBySocketId(socketId) {
    return this.socketToUsername.get(socketId) || null;
  }

  isUsernameTaken(username) {
    return this.usernameToSocket.has(username);
  }

  listOnlineUsers() {
    return Array.from(this.usernameToSocket.keys());
  }
}

module.exports = new UserDirectory();
