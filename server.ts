import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Game Rooms State
  const rooms = new Map<string, {
    id: string;
    players: { id: string; name: string; ready: boolean; score: number }[];
    betAmount: number;
    deckSeed: string;
    state: 'waiting' | 'playing' | 'finished';
  }>();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, playerName, betAmount }) => {
      let room = rooms.get(roomId);

      if (!room) {
        room = {
          id: roomId,
          players: [],
          betAmount: betAmount || 0,
          deckSeed: Math.random().toString(36).substring(7),
          state: 'waiting'
        };
        rooms.set(roomId, room);
      }

      if (room.state !== 'waiting' || room.players.length >= 2) {
        socket.emit('error', 'Room is full or game already started');
        return;
      }

      const player = { id: socket.id, name: playerName, ready: false, score: 0 };
      room.players.push(player);
      socket.join(roomId);

      io.to(roomId).emit('room_updated', room);
      console.log(`Player ${playerName} joined room ${roomId}`);
    });

    socket.on('player_ready', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.ready = true;
        
        // If all players ready, start the game
        if (room.players.length === 2 && room.players.every(p => p.ready)) {
          room.state = 'playing';
          io.to(roomId).emit('game_start', { deckSeed: room.deckSeed });
        } else {
          io.to(roomId).emit('room_updated', room);
        }
      }
    });

    socket.on('update_score', ({ roomId, score }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.score = score;
        socket.to(roomId).emit('opponent_score', { score });
      }
    });

    socket.on('game_won', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.state !== 'playing') return;

      room.state = 'finished';
      io.to(roomId).emit('game_over', { winnerId: socket.id });
      console.log(`Game won by ${socket.id} in room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Clean up rooms
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            room.state = 'waiting';
            io.to(roomId).emit('room_updated', room);
          }
        }
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
