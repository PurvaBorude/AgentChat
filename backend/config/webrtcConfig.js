// backend/config/webrtcConfig.js

module.exports = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }, // Public Google STUN server
    // Example TURN server config (you need credentials if you want to use TURN)
    /*
    {
      urls: 'turn:your.turn.server:3478',
      username: 'username',
      credential: 'password'
    }
    */
  ]
};
