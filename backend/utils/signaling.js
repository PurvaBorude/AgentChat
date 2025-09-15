// backend/utils/signaling.js

function sendOffer(io, toSocketId, offer) {
  io.to(toSocketId).emit('webrtc-offer', offer);
}

function sendAnswer(io, toSocketId, answer) {
  io.to(toSocketId).emit('webrtc-answer', answer);
}

function sendICECandidate(io, toSocketId, candidate) {
  io.to(toSocketId).emit('webrtc-ice-candidate', candidate);
}

module.exports = {
  sendOffer,
  sendAnswer,
  sendICECandidate,
};
