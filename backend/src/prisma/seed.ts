import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with actual 2026 World Cup Round of 32 data...');

  // Clean database
  await prisma.matchEvent.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Teams with actual 2026 World Cup details and flags
  const teamsData = [
    { name: 'South Africa', code: 'RSA', flagUrl: 'https://flagcdn.com/w320/za.png', groupName: 'A' },
    { name: 'Canada', code: 'CAN', flagUrl: 'https://flagcdn.com/w320/ca.png', groupName: 'B' },
    { name: 'Brazil', code: 'BRA', flagUrl: 'https://flagcdn.com/w320/br.png', groupName: 'B' },
    { name: 'Japan', code: 'JPN', flagUrl: 'https://flagcdn.com/w320/jp.png', groupName: 'C' },
    { name: 'Germany', code: 'GER', flagUrl: 'https://flagcdn.com/w320/de.png', groupName: 'D' },
    { name: 'Paraguay', code: 'PAR', flagUrl: 'https://flagcdn.com/w320/py.png', groupName: 'D' },
    { name: 'Netherlands', code: 'NED', flagUrl: 'https://flagcdn.com/w320/nl.png', groupName: 'E' },
    { name: 'Morocco', code: 'MAR', flagUrl: 'https://flagcdn.com/w320/ma.png', groupName: 'E' },
    { name: 'Côte d\'Ivoire', code: 'CIV', flagUrl: 'https://flagcdn.com/w320/ci.png', groupName: 'F' },
    { name: 'Norway', code: 'NOR', flagUrl: 'https://flagcdn.com/w320/no.png', groupName: 'F' },
    { name: 'France', code: 'FRA', flagUrl: 'https://flagcdn.com/w320/fr.png', groupName: 'G' },
    { name: 'Sweden', code: 'SWE', flagUrl: 'https://flagcdn.com/w320/se.png', groupName: 'G' },
    { name: 'United States', code: 'USA', flagUrl: 'https://flagcdn.com/w320/us.png', groupName: 'H' },
    { name: 'Bosnia and Herzegovina', code: 'BIH', flagUrl: 'https://flagcdn.com/w320/ba.png', groupName: 'H' },
    { name: 'Argentina', code: 'ARG', flagUrl: 'https://flagcdn.com/w320/ar.png', groupName: 'I' },
    { name: 'Cabo Verde', code: 'CPV', flagUrl: 'https://flagcdn.com/w320/cv.png', groupName: 'I' },
    { name: 'Australia', code: 'AUS', flagUrl: 'https://flagcdn.com/w320/au.png', groupName: 'J' },
    { name: 'Egypt', code: 'EGY', flagUrl: 'https://flagcdn.com/w320/eg.png', groupName: 'J' },
    { name: 'Mexico', code: 'MEX', flagUrl: 'https://flagcdn.com/w320/mx.png', groupName: 'A' },
    { name: 'Ecuador', code: 'ECU', flagUrl: 'https://flagcdn.com/w320/ec.png', groupName: 'A' },
  ];

  const teams: { [key: string]: any } = {};
  for (const t of teamsData) {
    teams[t.code] = await prisma.team.create({ data: t });
  }

  console.log('Teams seeded successfully.');

  // 1. Matches for Yesterday (June 27) - Group Stage final matches (Finished)
  await prisma.match.create({
    data: {
      homeTeamId: teams['MEX'].id,
      awayTeamId: teams['ECU'].id,
      homeScore: 2,
      awayScore: 1,
      status: 'FINISHED',
      kickoffTime: new Date('2026-06-27T18:00:00Z'),
      venue: 'Estadio Azteca, Mexico City',
      isFeatured: false,
      events: {
        create: [
          { playerName: 'Santiago Giménez', type: 'GOAL', minute: 14, teamId: teams['MEX'].id },
          { playerName: 'Enner Valencia', type: 'GOAL', minute: 40, teamId: teams['ECU'].id },
          { playerName: 'Edson Álvarez', type: 'YELLOW_CARD', minute: 55, teamId: teams['MEX'].id },
          { playerName: 'Luis Chávez', type: 'GOAL', minute: 76, teamId: teams['MEX'].id },
        ]
      }
    }
  });

  // 2. Matches for Today (June 28) - South Africa vs Canada (Round of 32 - UPCOMING)
  await prisma.match.create({
    data: {
      homeTeamId: teams['RSA'].id,
      awayTeamId: teams['CAN'].id,
      homeScore: 0,
      awayScore: 0,
      status: 'UPCOMING',
      minute: 0,
      kickoffTime: new Date('2026-06-28T19:00:00Z'), // 3:00 PM EST (19:00 UTC)
      venue: 'SoFi Stadium, Los Angeles',
      isFeatured: true,
    }
  });

  // 3. Matches for Tomorrow (June 29) - Round of 32 (Upcoming)
  await prisma.match.create({
    data: {
      homeTeamId: teams['BRA'].id,
      awayTeamId: teams['JPN'].id,
      homeScore: 0,
      awayScore: 0,
      status: 'UPCOMING',
      kickoffTime: new Date('2026-06-29T20:00:00Z'),
      venue: 'NRG Stadium, Houston',
      isFeatured: false,
    }
  });

  await prisma.match.create({
    data: {
      homeTeamId: teams['GER'].id,
      awayTeamId: teams['PAR'].id,
      homeScore: 0,
      awayScore: 0,
      status: 'UPCOMING',
      kickoffTime: new Date('2026-06-29T16:00:00Z'),
      venue: 'Gillette Stadium, Boston',
      isFeatured: false,
    }
  });

  // 4. Matches for June 30 - Round of 32 (Upcoming)
  await prisma.match.create({
    data: {
      homeTeamId: teams['NED'].id,
      awayTeamId: teams['MAR'].id,
      homeScore: 0,
      awayScore: 0,
      status: 'UPCOMING',
      kickoffTime: new Date('2026-06-30T18:00:00Z'),
      venue: 'Estadio BBVA, Monterrey',
      isFeatured: false,
    }
  });

  await prisma.match.create({
    data: {
      homeTeamId: teams['FRA'].id,
      awayTeamId: teams['SWE'].id,
      homeScore: 0,
      awayScore: 0,
      status: 'UPCOMING',
      kickoffTime: new Date('2026-06-30T21:00:00Z'),
      venue: 'MetLife Stadium, East Rutherford',
      isFeatured: false,
    }
  });

  console.log('Matches seeded successfully.');
  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
