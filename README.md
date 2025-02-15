# Lottery Game (MERN Stack)

## Introduction
This is a MERN stack-based lottery game inspired by 'El Lotería'. It allows two users to enter unique numbers into 3x3 grids and play a randomized game where numbers are progressively drawn. The first user to complete a row or column wins!

## Features
- Two-player game setup
- Unique 3x3 grids for each player
- Real-time updates using **Socket.io**
- MongoDB listener to track and update game progress
- Auto-updating UI with Material-UI (MUI)
- Random number generator to mark the grid
- Winning detection for row/column completion

## Importance
This project demonstrates key web development skills, including:
- **MERN stack implementation** (MongoDB, Express, React, Node.js)
- **Real-time updates** with WebSockets
- **Database-driven game logic**
- **User-friendly UI/UX** with Material-UI
- **Server-client communication** using REST APIs and WebSockets

## Technologies Used
- **Frontend:** React, Material-UI (MUI)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with real-time listeners)
- **WebSockets:** Socket.io

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **MongoDB** (running locally or via cloud)
- **Git**

### Steps
1. **Clone the Repository**
   ```sh
   git clone https://github.com/your-username/lottery-game.git
   cd lottery-game
   ```
2. **Install Backend Dependencies**
   ```sh
   cd backend
   npm install
   ```
3. **Install Frontend Dependencies**
   ```sh
   cd ../frontend
   npm install
   ```
4. **Create an Environment File**
   In the `backend` directory, create a `.env` file and add the following:
   ```sh
   MONGO_URI=your_mongodb_connection_string
   ```
   Replace `your_mongodb_connection_string` with your actual MongoDB database path.

5. **Start MongoDB** (if running locally)
   ```sh
   mongod --dbpath /your/db/path
   ```
6. **Run Backend Server**
   ```sh
   cd ../backend
   npm start
   ```
7. **Run Frontend**
   ```sh
   cd ../frontend
   npm start
   ```
8. **Access the game**
   Open `http://localhost:3000` in your browser.

## Usage
1. Each player fills their 3x3 grid with **unique numbers (1-9)**.
2. Click **"Start Game"** to begin.
3. Click **"Generate Number"** to randomly draw numbers.
4. The drawn number turns **red** when clicked.
5. The first player to complete a **row or column** wins!
6. Click **"Restart Game"** to play again.

## Future Enhancements
- Add multiplayer support with user authentication
- Improve UI with animations
- Implement a leaderboard system
- Deploy the game online

## Contributing
Contributions are welcome! Fork the repo, create a new branch, and submit a pull request.

## License
MIT License

---
Enjoy the game! 🎉

