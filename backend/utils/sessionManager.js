// backend/utils/sessionManager.js
// Tracks pending invites and current logical connections (username -> roomId).
// Separate from tempChats (tempChats only stores messages).

class SessionManager {
  constructor() {
    this.pendingInvites = new Map(); // fromUsername -> toUsername
    this.connections = new Map(); // username -> roomId
  }

  // Invite management
  addInvite(from, to) {
    this.pendingInvites.set(from, to);
  }
  removeInvite(from) {
    this.pendingInvites.delete(from);
  }
  // Remove any invites to OR from a user, return list of removed entries for notification
  removeInvitesInvolving(username) {
    const removed = [];
    for (const [from, to] of Array.from(this.pendingInvites.entries())) {
      if (from === username || to === username) {
        removed.push({ from, to });
        this.pendingInvites.delete(from);
      }
    }
    return removed;
  }
  getInviteTo(from) {
    return this.pendingInvites.get(from) || null;
  }
  // Get incoming invites to a username
  getIncomingInvites(toUsername) {
    return Array.from(this.pendingInvites.entries())
      .filter(([f, t]) => t === toUsername)
      .map(([f, t]) => ({ from: f, to: t }));
  }

  // Connection management
  addConnection(username, roomId) {
    this.connections.set(username, roomId);
  }
  removeConnection(username) {
    this.connections.delete(username);
  }
  getConnectionRoom(username) {
    return this.connections.get(username) || null;
  }
  // Get pairs grouped by roomId: [{ roomId, users: [u1,u2] }, ...]
  getConnectedGroups() {
    const byRoom = new Map();
    for (const [username, roomId] of this.connections.entries()) {
      if (!byRoom.has(roomId)) byRoom.set(roomId, []);
      byRoom.get(roomId).push(username);
    }
    return Array.from(byRoom.entries()).map(([roomId, users]) => ({ roomId, users }));
  }

  // Snapshot used for broadcasting to clients to compute statuses
  snapshot() {
    const pending = Array.from(this.pendingInvites.entries()).map(([from, to]) => ({ from, to }));
    const connected = this.getConnectedGroups();
    return { pending, connected };
  }
}

module.exports = new SessionManager();
