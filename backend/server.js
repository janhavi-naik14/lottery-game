const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tlsAllowInvalidCertificates: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
const gameRoutes = require("./routes/gameRoutes");
app.use("/api/game", gameRoutes);

// MongoDB Change Stream for real-time updates
const Game = require("./models/Game");

const gameChangeStream = Game.watch();

gameChangeStream.on("change", async (change) => {
  try {
    if (change.operationType === "update") {
      const game = await Game.findById(change.documentKey._id);
      if (game) io.emit("gameUpdate", game);
    }
  } catch (error) {
    console.error("❌ Error processing game update:", error);
  }
});

gameChangeStream.on("error", (error) => {
  console.error("❌ MongoDB Change Stream Error:", error);
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
