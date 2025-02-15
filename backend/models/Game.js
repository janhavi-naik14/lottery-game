const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Unique ID for users
  username: { type: String, required: true },
  grid: { 
    type: [[Number]], 
    validate: {
      validator: function (grid) {
        const numbers = grid.flat();
        return numbers.length === new Set(numbers).size && numbers.every(num => num >= 1 && num <= 9);
      },
      message: "Grid numbers must be unique and between 1-9.",
    },
    required: true,
  }, 
  cutNumbers: { type: [Number], default: [] },
  won: { type: Boolean, default: false },
});

const GameSchema = new mongoose.Schema(
  {
    users: { type: [UserSchema], validate: (users) => users.length === 2 }, // Only 2 users allowed
    currentNumber: { type: Number, default: null }, // Stores the last generated number
    status: { type: String, enum: ["waiting", "in-progress", "finished"], default: "waiting" }, // Game state tracking
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", GameSchema);
