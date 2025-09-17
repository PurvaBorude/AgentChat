// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

// Utils
const userDirectory = require("./utils/userDirectory");
const tempChats = require("./utils/tempChats");

// Event Handlers
const registerConnectionHandlers = require("./events/connectionHandlers");
const registerInviteHandlers = require("./events/inviteHandlers");
const registerChatHandlers = require("./events/chatHandlers");
const registerHistoryHandlers = require("./events/historyHandlers");
const registerWebRTCHandlers = require("./events/webrtcHandlers");
const registerFileHandlers = require("./events/fileHandlers");

// Routes
const fileRoutes = require("./routes/fileRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// File routes
app.use("/api/files", fileRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  // Register all handlers
  registerConnectionHandlers(io, socket, userDirectory, tempChats);
  registerInviteHandlers(io, socket, userDirectory, tempChats);
  registerChatHandlers(io, socket, userDirectory, tempChats);
  registerHistoryHandlers(io, socket, tempChats);
  registerWebRTCHandlers(io, socket, userDirectory);
  registerFileHandlers(io, socket, userDirectory);
});

// Serve frontend (Vite build)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
