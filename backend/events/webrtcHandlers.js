// backend/events/webrtcHandlers.js
const signaling = require('../utils/signaling');

module.exports = function(io, socket, userDirectory) {
  socket.on('webrtc-offer', ({ toUsername, offer }) => {
    const toSocketId = userDirectory.getSocketId(toUsername);
    if (toSocketId) {
      signaling.sendOffer(io, toSocketId, { fromUsername: socket.username, offer });
    }
  });

  socket.on('webrtc-answer', ({ toUsername, answer }) => {
    const toSocketId = userDirectory.getSocketId(toUsername);
    if (toSocketId) {
      signaling.sendAnswer(io, toSocketId, { fromUsername: socket.username, answer });
    }
  });

  socket.on('webrtc-ice-candidate', ({ toUsername, candidate }) => {
    const toSocketId = userDirectory.getSocketId(toUsername);
    if (toSocketId) {
      signaling.sendICECandidate(io, toSocketId, { fromUsername: socket.username, candidate });
    }
  });
};
