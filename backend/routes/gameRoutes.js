const express = require("express");
const Game = require("../models/Game");
const router = express.Router();

// Get the latest game
router.get("/latest", async (req, res) => {
  try {
    const game = await Game.findOne().sort({ createdAt: -1 });
    if (!game) return res.status(404).json(null);
    res.json(game);
  } catch (err) {
    console.error("❌ Error fetching latest game:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new game
router.post("/new", async (req, res) => {
  try {
    const { users } = req.body;
    if (!users || !Array.isArray(users) || users.length !== 2) {
      return res.status(400).json({ error: "Game must have exactly 2 users." });
    }

    users.forEach((user) => {
      const flatGrid = user.grid.flat();
      if (new Set(flatGrid).size !== 9 || !flatGrid.every((num) => num >= 1 && num <= 9)) {
        throw new Error("Each grid must contain unique numbers from 1-9.");
      }
    });

    const game = new Game({ users, status: "active" });
    await game.save();
    res.status(201).json(game);
  } catch (err) {
    console.error("❌ Error creating new game:", err);
    res.status(500).json({ error: err.message });
  }
});

// Cut a number and check for a winner or tie
router.post("/cutNumber", async (req, res) => {
  try {
    const { gameId, number } = req.body;
    if (!gameId || typeof number !== "number") {
      return res.status(400).json({ error: "Invalid game ID or number." });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      console.error("❌ Game not found:", gameId);
      return res.status(404).json({ error: "Game not found" });
    }

    let numberCut = false;
    let winners = 0;

    game.users.forEach((user) => {
      const flatGrid = user.grid.flat();

      if (flatGrid.includes(number) && !user.cutNumbers.includes(number)) {
        console.log(`✅ Cutting number ${number} for ${user.username}`);
        user.cutNumbers.push(number);
        numberCut = true;

        // Check for a win (row or column)
        for (let i = 0; i < 3; i++) {
          if (user.grid[i].every((n) => user.cutNumbers.includes(n))) {
            user.won = true;
          }
          if ([0, 1, 2].every((j) => user.cutNumbers.includes(user.grid[j][i]))) {
            user.won = true;
          }
        }
        
        if (user.won) winners++;
      }
    });

    if (!numberCut) {
      console.warn(`⚠️ Number ${number} was already cut or not in any grid.`);
      return res.status(400).json({ error: "Number already cut or not in grid." });
    }

    if (winners === 2) {
      game.status = "tie"; // Both users won simultaneously
      console.log("🤝 It's a Tie!");
    } else if (winners === 1) {
      game.status = "finished"; // One player won
      console.log("🎉 Game Over! We have a winner.");
    }

    game.markModified("users");
    await game.save();

    res.json({ success: true, game });
  } catch (err) {
    console.error("❌ Error processing cutNumber:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;