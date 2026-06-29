import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schemas
const GetMatchesQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const UpdateMatchSchema = z.object({
  homeScore: z.number().min(0).optional(),
  awayScore: z.number().min(0).optional(),
  status: z.enum(['UPCOMING', 'LIVE', 'FINISHED', 'POSTPONED']).optional(),
  minute: z.number().min(0).max(120).optional(),
});

export const getMatchesByDate = async (req: Request, res: Response) => {
  try {
    const parsedQuery = GetMatchesQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ error: parsedQuery.error.errors[0].message });
    }

    const dateStr = parsedQuery.data.date;
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const matches = await prisma.match.findMany({
      where: {
        kickoffTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        events: {
          orderBy: {
            minute: 'asc',
          },
        },
      },
      orderBy: {
        kickoffTime: 'asc',
      },
    });

    return res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeaturedMatch = async (req: Request, res: Response) => {
  try {
    // Look for explicitly featured match
    let featured = await prisma.match.findFirst({
      where: { isFeatured: true },
      include: {
        homeTeam: true,
        awayTeam: true,
        events: {
          orderBy: {
            minute: 'asc',
          },
        },
      },
    });

    // Fallback: If no match is explicitly marked as featured, get the first LIVE match
    if (!featured) {
      featured = await prisma.match.findFirst({
        where: { status: 'LIVE' },
        include: {
          homeTeam: true,
          awayTeam: true,
          events: {
            orderBy: {
              minute: 'asc',
            },
          },
        },
      });
    }

    // Fallback 2: Get the next UPCOMING match
    if (!featured) {
      featured = await prisma.match.findFirst({
        where: { status: 'UPCOMING' },
        include: {
          homeTeam: true,
          awayTeam: true,
          events: {
            orderBy: {
              minute: 'asc',
            },
          },
        },
        orderBy: {
          kickoffTime: 'asc',
        },
      });
    }

    if (!featured) {
      return res.status(404).json({ error: 'No featured match found' });
    }

    return res.json(featured);
  } catch (error) {
    console.error('Error fetching featured match:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin/Simulation endpoint to update match and trigger WebSocket event
export const updateMatch = async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id, 10);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const parsedBody = UpdateMatchSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.errors });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: parsedBody.data,
      include: {
        homeTeam: true,
        awayTeam: true,
        events: {
          orderBy: {
            minute: 'asc',
          },
        },
      },
    });

    // Notify connected WebSocket clients (using global io instance)
    const io = req.app.get('io');
    if (io) {
      io.emit('matchUpdate', updatedMatch);
      // Also emit a specific room if needed, e.g., `match:${matchId}`
      io.to(`match:${matchId}`).emit('matchDetailUpdate', updatedMatch);
    }

    return res.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
