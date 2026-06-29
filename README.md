# FIFA 2026 World Cup Game Tracker

A real-time, full-stack mobile application for tracking games during the 2026 FIFA World Cup, built using **React Native**, **Expo**, and **TypeScript**. 

---

## Tech Stack

### Mobile Client (Frontend)
- **Framework**: [Expo](https://expo.dev/) (SDK 56) & [React Native](https://reactnative.dev/) (v0.85)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing & Native Tabs)
- **State Management & Caching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Real-Time Communication**: [Socket.io-client](https://socket.io/)
- **Image Caching**: [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) (for fast, smooth flag rendering)
- **Icons**: [Lucide React Native](https://lucide.dev/)

### API & WebSockets (Backend)
- **Runtime**: [Node.js](https://nodejs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Real-Time Server**: [Socket.io](https://socket.io/) (for broadcasting live match events)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [SQLite](https://www.sqlite.org/) (for instant local setup; easily swappable to PostgreSQL)
- **Validation & Security**:
  - [Zod](https://zod.dev/) (Request input validation and sanitization)
  - [Helmet](https://helmetjs.github.io/) (Secure HTTP headers)
  - [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit) (API rate limiting and DDoS protection)

---

## Functional Features

1. **Featured Game Hero Card**:
   - Anchored at the top of the home screen.
   - Highlights the highest priority game (active `LIVE` match, next `UPCOMING` match, or a featured match).
   - Features a pulsing red **LIVE** indicator and active match minute.
   - Displays a chronological list of match events (goals, cards, substitutions).

2. **Horizontal Date Navigation**:
   - A scrollable calendar bar at the top of the app.
   - Tapping any date instantly filters and displays matches scheduled for that day.
   - Pre-populated with dates from **June 25 to July 1, 2026**.

3. **Daily Match List**:
   - Lists all matches scheduled for the selected day, sorted chronologically.
   - Categorized by match status: `LIVE` (green indicator), `FINISHED` (labeled FT), or `UPCOMING` (displays local kickoff time).

4. **Inline Expandable Cards**:
   - Tapping any match card in the list expands it inline with a smooth transition.
   - Reveals the stadium venue and a detailed list of match events (scorers, cards, etc.).

5. **Live Simulation Engine**:
   - A background simulation engine in the backend increments the match minutes of active `LIVE` matches every 20 seconds.
   - Randomly generates major match events (goals, yellow/red cards) for players and broadcasts them to all connected mobile clients via WebSockets, updating the UI instantly without page reloads.

6. **Accessibility (A11y) Focus**:
   - Adheres to **WCAG 2.1 AA** guidelines.
   - **Screen Reader Support**: Full usage of `accessible={true}`, `accessibilityRole`, and `accessibilityState`.
   - **Dynamic Spoken Summaries**: The featured match card uses a synthesized `accessibilityLabel` that translates the visual scoreboard and events into a single, cohesive spoken paragraph (e.g., *"Featured Match: South Africa 1, Canada 1. Live, 65th minute. Goals by Lyle Foster for South Africa in the 22nd minute..."*).
   - **Touch Targets**: All interactive elements have a minimum size of 48x48dp to ensure ease of tapping.
   - **High Contrast**: Sleek, high-contrast Dark and Light themes.

---

## Project Structure

```
World-Cup-Game-Tracker/
├── mobile/                 # React Native + Expo App
│   ├── src/
│   │   ├── app/            # Expo Router screens (Home, Explore Guide)
│   │   ├── components/     # UI components (ThemedView, ThemedText)
│   │   ├── constants/      # Design tokens (Colors, Spacing, Fonts)
│   │   ├── hooks/          # useMatches (TanStack Query + Socket.io hook)
│   │   └── services/       # api.ts (API client & Socket.io initialization)
│   └── package.json
│
├── backend/                # Node.js + Express + Prisma API
│   ├── prisma/             # Prisma schema and SQLite database
│   └── src/
│       ├── controllers/    # Route controllers (Get matches, Update matches)
│       ├── routes/         # Express API routes
│       ├── prisma/         # Database seeding script (seed.ts)
│       └── index.ts        # Express + Socket.io server & Simulation Engine
```

---

## How to Run

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Start the Backend
The backend runs the REST API, WebSocket server, and the match simulator.
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```
The server will start at `http://localhost:3000`. You will see simulation updates in the console:
`[Simulation] Match 2 - RSA 1:1 CAN (66')`

### 3. Start the Mobile Client
The client can be run on Web, iOS, or Android.
```bash
cd mobile
npm install
npm run web
```
This will start the Metro Bundler and open the app in your browser at `http://localhost:8081`. 

*Note: For testing on physical mobile devices, download the **Expo Go** app from the App Store or Google Play, and scan the QR code printed in your terminal.*

---

## Android APK Build (EAS)

To generate a downloadable APK for Android without needing a local Android SDK setup:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
2. **Log in to your Expo Account**:
   ```bash
   eas login
   ```
3. **Run the Build**:
   ```bash
   cd mobile
   eas build -p android --profile preview
   ```
4. **Download the APK**:
   Once the build completes, the terminal will output a **downloadable link** and a **QR code**. Scan the QR code or click the link to download and install the `.apk` file directly onto your Android device.

---

## Security Audit & Secrets Verification

Prior to pushing to GitHub, a thorough security scan was conducted. We have verified that **no API keys, database credentials, or private secrets are hardcoded in the codebase**:
- The backend uses standard environment variables via `process.env` (managed through `dotenv` in development).
- The mobile client uses dynamic IP resolution (`Constants.expoConfig?.hostUri`) to connect to the local API server, meaning no hardcoded backend IP addresses or credentials are exposed in the build.
- The database is a local SQLite file (`dev.db`), which is excluded from git via `.gitignore`.

