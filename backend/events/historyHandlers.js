// backend/events/historyHandlers.js
module.exports = function(io, socket, tempChats) {
  socket.on('getHistory', (roomId, callback) => {
    if (!roomId) return callback({ success: false, error: 'No roomId.' });

    const messages = tempChats.getMessages(roomId);
    callback({ success: true, messages });
  });
};
