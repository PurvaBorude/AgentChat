// backend/utils/tempChats.js
class TempChats {
  constructor() {
    this.rooms = new Map(); // roomId -> [messageObjects]
  }

  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
  }

  addMessage(roomId, messageObj) {
    if (!this.rooms.has(roomId)) this.createRoom(roomId);
    this.rooms.get(roomId).push(messageObj);
  }

  getMessages(roomId) {
    return this.rooms.get(roomId) || [];
  }

  deleteRoom(roomId) {
    this.rooms.delete(roomId);
  }
}

module.exports = new TempChats();
