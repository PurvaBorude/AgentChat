// backend/events/fileHandlers.js

/**
 * Handles file sharing events over Socket.IO.
 * This assumes files are uploaded via /api/files/upload
 * and we only share the resulting file URL + metadata here.
 */
module.exports = function registerFileHandlers(io, socket, userDirectory) {
  // Listen for file share events from a client
  socket.on("sendFile", (data) => {
    /*
      Expected data format:
      {
        to: "recipientSocketId",   // who should receive
        fileUrl: "/uploads/12345.png", // path returned by upload API
        fileName: "myphoto.png",
        fileType: "image/png"
      }
    */

    console.log(`📁 File shared from ${socket.id} to ${data.to}: ${data.fileName}`);

    // Emit file to recipient
    io.to(data.to).emit("receiveFile", {
      from: socket.id,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileType: data.fileType
    });
  });
};
