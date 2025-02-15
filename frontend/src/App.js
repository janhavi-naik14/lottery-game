import React, { useState, useEffect } from "react";
import { Container, Grid, Button, Typography, Paper, TextField, Box } from "@mui/material";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const App = () => {
  const [gameId, setGameId] = useState(null);
  const [grids, setGrids] = useState([
    Array.from({ length: 3 }, () => Array(3).fill("")),
    Array.from({ length: 3 }, () => Array(3).fill(""))
  ]);
  const [cutNumbers, setCutNumbers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [lastGeneratedNumber, setLastGeneratedNumber] = useState(null);

  useEffect(() => {
    fetchGameData();
    socket.on("gameUpdate", (update) => fetchGameData(update._id));
    return () => socket.off("gameUpdate");
  }, []);

  const fetchGameData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/game/latest");
      if (res.data) {
        setGameId(res.data._id);
        setCutNumbers(res.data.users.flatMap((user) => user.cutNumbers));
        setGrids(res.data.users.map((user) => user.grid));
        setGameStarted(true);

        const winningUsers = res.data.users.filter((user) => user.won);
        if (winningUsers.length === 2) {
          setWinner("🤝 It's a Tie!");
        } else if (winningUsers.length === 1) {
          setWinner(`${winningUsers[0].username} wins the game!`);
        }
      }
    } catch (err) {
      console.error("No existing game found, please start a new one.");
    }
  };

  const handleInputChange = (e, userIndex, rowIndex, colIndex) => {
    let value = e.target.value;

    if (value === "") {
      setGrids((prevGrids) => {
        const newGrids = prevGrids.map((g, gIndex) =>
          gIndex === userIndex
            ? g.map((r, rIndex) =>
                rIndex === rowIndex
                  ? r.map((c, cIndex) => (cIndex === colIndex ? "" : c))
                  : r
              )
            : g
        );
        return newGrids;
      });
      return;
    }

    value = parseInt(value, 10);
    if (isNaN(value) || value < 1 || value > 9) return;

    setGrids((prevGrids) => {
      const newGrids = prevGrids.map((g, gIndex) =>
        gIndex === userIndex
          ? g.map((r, rIndex) =>
              rIndex === rowIndex
                ? r.map((c, cIndex) => (cIndex === colIndex ? value : c))
                : r
            )
          : g
      );
      return newGrids;
    });
  };

  const startGame = async () => {
    if (grids.some(grid => new Set(grid.flat()).size !== 9)) {
      alert("Each grid must have unique numbers from 1 to 9.");
      return;
    }

    try {
      const users = [
        { username: "User 1", grid: grids[0], cutNumbers: [] },
        { username: "User 2", grid: grids[1], cutNumbers: [] }
      ];
      const res = await axios.post("http://localhost:5000/api/game/new", { users });
      setGameId(res.data._id);
      setCutNumbers([]);
      setWinner(null);
      setGameStarted(true);
      setLastGeneratedNumber(null);
    } catch (err) {
      console.error("Error starting game:", err);
    }
  };

  const generateRandomNumber = async () => {
    if (!gameId) return console.error("Start a game first.");
    if (winner) return;

    let number;
    const availableNumbers = Array.from({ length: 9 }, (_, i) => i + 1).filter(n => !cutNumbers.includes(n));
    if (availableNumbers.length === 0) {
      alert("All numbers have been drawn!");
      return;
    }

    do {
      number = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    } while (cutNumbers.includes(number));

    try {
      await axios.post("http://localhost:5000/api/game/cutNumber", { gameId, number });
      setLastGeneratedNumber(number);
    } catch (err) {
      console.error("Error cutting number:", err);
    }
  };

  const restartGame = () => {
    setGameId(null);
    setGrids([
      Array.from({ length: 3 }, () => Array(3).fill("")),
      Array.from({ length: 3 }, () => Array(3).fill(""))
    ]);
    setCutNumbers([]);
    setWinner(null);
    setGameStarted(false);
    setLastGeneratedNumber(null);
  };

  return (
    <Container
      sx={{
        fontFamily: "'Sofia', cursive",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: "100vh",
        gap: 3
      }}
    >
      <Typography variant="h4" sx={{ fontFamily: "'Sofia', cursive" }}>Lottery Game</Typography>

      <Grid container spacing={5} justifyContent="center" alignItems="center" flexWrap="wrap">
      
        {grids.map((grid, userIndex) => (
          <Grid item xs={12} sm={6} key={userIndex}>
            <Paper
              sx={{
                padding: 4,
                textAlign: "center",
                width: "100%",
                maxWidth: "320px",
                margin: "0 auto",
                borderRadius: "12px",
                backgroundColor: "#f5f5f5",
                fontFamily: "'Sofia', cursive"
              }}
            >
              <Typography variant="h6" sx={{ fontFamily: "'Sofia', cursive" }}>User {userIndex + 1}</Typography>
              {grid.map((row, rowIndex) => (
                <Grid container key={rowIndex} justifyContent="center">
                  {row.map((cell, colIndex) => (
                    <TextField
                      key={colIndex}
                      value={cell || ""}
                      onChange={(e) => handleInputChange(e, userIndex, rowIndex, colIndex)}
                      disabled={gameStarted}
                      inputProps={{ maxLength: 1 }}
                      sx={{
                        width: 60,
                        height: 60,
                        margin: 1,
                        fontSize: "1.5rem",
                        textAlign: "center",
                        fontFamily: "'Sofia', cursive",
                        backgroundColor: cutNumbers.includes(Number(cell))
                          ? lastGeneratedNumber === Number(cell)
                            ? "red"
                            : "#ffcccc"
                          : "white",
                      }}
                    />
                  ))}
                </Grid>
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {winner && (
        <Typography variant="h5" sx={{ fontFamily: "'Sofia', cursive",color: "green", mt: 2, fontWeight: "bold" }}>
          🎉 {winner} 🎉
        </Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 3 }}>
        {!gameStarted && (
          <Button  variant="contained" onClick={startGame}>
            Start Game
          </Button>
        )}
        {gameStarted && !winner && (
          <Button variant="contained" onClick={generateRandomNumber}>
            Generate Number
          </Button>
        )}
        {winner && (
          <Button variant="contained" color="secondary" onClick={restartGame}>
            Restart Game
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default App;
