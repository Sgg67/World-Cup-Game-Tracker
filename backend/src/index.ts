import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import matchRoutes from './routes/matchRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for mobile/development purposes
    methods: ['GET', 'POST', 'PATCH'],
  },
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: '*' })); // Restrict in production
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Share socket.io instance with Express controllers
app.set('io', io);

// Routes
app.use('/api/matches', matchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Client can join a specific match room for detailed updates
  socket.on('joinMatch', (matchId: string) => {
    socket.join(`match:${matchId}`);
    console.log(`Client ${socket.id} joined room: match:${matchId}`);
  });

  socket.on('leaveMatch', (matchId: string) => {
    socket.leave(`match:${matchId}`);
    console.log(`Client ${socket.id} left room: match:${matchId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Live Match Simulation Engine
// Updates active LIVE matches and starts reached upcoming matches every 20 seconds
const runLiveSimulation = async () => {
  try {
    const now = new Date();

    // Auto-start upcoming matches that have reached their kickoff time
    const upcomingToStart = await prisma.match.findMany({
      where: {
        status: 'UPCOMING',
        kickoffTime: { lte: now },
      },
      include: { homeTeam: true, awayTeam: true },
    });

    for (const match of upcomingToStart) {
      const startedMatch = await prisma.match.update({
        where: { id: match.id },
        data: { status: 'LIVE', minute: 1 },
        include: {
          homeTeam: true,
          awayTeam: true,
          events: { orderBy: { minute: 'asc' } },
        },
      });
      io.emit('matchUpdate', startedMatch);
      io.to(`match:${match.id}`).emit('matchDetailUpdate', startedMatch);
      console.log(`[Simulation] Match ${match.id} (${match.homeTeam.code} vs ${match.awayTeam.code}) has reached kickoff time and is now LIVE!`);
    }

    const liveMatches = await prisma.match.findMany({
      where: { status: 'LIVE' },
      include: { homeTeam: true, awayTeam: true },
    });

    for (const match of liveMatches) {
      let nextMinute = match.minute + 1;
      let nextStatus = match.status;
      let homeScore = match.homeScore;
      let awayScore = match.awayScore;

      // Handle match completion
      if (nextMinute >= 90) {
        nextMinute = 90;
        nextStatus = 'FINISHED';
        console.log(`Match ${match.id} (${match.homeTeam.code} vs ${match.awayTeam.code}) has finished!`);
      }

      // 15% chance of a major event (Goal or Card) if the match is still active
      let eventCreated = false;
      if (nextStatus === 'LIVE' && Math.random() < 0.15) {
        const isHomeTeam = Math.random() > 0.5;
        const activeTeam = isHomeTeam ? match.homeTeam : match.awayTeam;
        const eventType = Math.random() > 0.6 ? 'GOAL' : 'YELLOW_CARD';
        
        let playerName = 'Player';
        if (eventType === 'GOAL') {
          if (isHomeTeam) {
            homeScore += 1;
            playerName = ['Pulisic', 'Balogun', 'McKennie', 'Weah'][Math.floor(Math.random() * 4)];
          } else {
            awayScore += 1;
            playerName = ['Kane', 'Bellingham', 'Saka', 'Foden'][Math.floor(Math.random() * 4)];
          }
        } else {
          playerName = isHomeTeam 
            ? ['Adams', 'Robinson', 'Dest'][Math.floor(Math.random() * 3)]
            : ['Rice', 'Stones', 'Walker'][Math.floor(Math.random() * 3)];
        }

        // Create the event
        await prisma.matchEvent.create({
          data: {
            matchId: match.id,
            teamId: activeTeam.id,
            playerName,
            type: eventType,
            minute: nextMinute,
          },
        });
        eventCreated = true;
      }

      // Update the match in database
      const updatedMatch = await prisma.match.update({
        where: { id: match.id },
        data: {
          minute: nextMinute,
          status: nextStatus,
          homeScore,
          awayScore,
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          events: {
            orderBy: { minute: 'asc' },
          },
        },
      });

      // Broadcast update to all clients
      io.emit('matchUpdate', updatedMatch);
      // Broadcast to the specific match detail room
      io.to(`match:${match.id}`).emit('matchDetailUpdate', updatedMatch);

      console.log(
        `[Simulation] Match ${match.id} - ${match.homeTeam.code} ${homeScore}:${awayScore} ${match.awayTeam.code} (${nextMinute}')` +
        (eventCreated ? ` - Event Created!` : '')
      );
    }
  } catch (error) {
    console.error('Error in live simulation:', error);
  }
};

// Start simulation interval (every 20 seconds)
setInterval(runLiveSimulation, 20000);

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
