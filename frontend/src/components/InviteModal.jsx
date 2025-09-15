/*import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function InviteModal({ onAccept }) {
  const { invite, acceptInvite, rejectInvite, setChatRoom } = useSocket();

  if (!invite) return null;

  const handleAccept = () => {
    // 1. Accept invite via socket
    acceptInvite(invite.fromUsername);

    // 2. Set chatRoomId in context so ChatWindow knows which room
    setChatRoom(invite.chatRoomId || invite.fromUsername); // example, adjust based on your socket logic

    // 3. Navigate to chat page
    if (onAccept) onAccept();
  };

  const handleReject = () => {
    rejectInvite(invite.fromUsername);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>
          You have an invite from <strong>{invite.fromUsername}</strong>.
        </p>
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleReject}>Reject</button>
      </div>
    </div>
  );
}

*/

import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function InviteModal({ onAccept }) {
  const { invite, acceptInvite, rejectInvite } = useSocket();
  if (!invite) return null;

  const handleAccept = () => {
    acceptInvite(invite.fromUsername); // notify server
    if (onAccept) onAccept();
  };

  const handleReject = () => {
    rejectInvite(invite.fromUsername); // notify sender
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>Invite from <strong>{invite.fromUsername}</strong></p>
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleReject}>Reject</button>
      </div>
    </div>
  );
}
