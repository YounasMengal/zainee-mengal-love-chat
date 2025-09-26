[![Netlify Status](https://api.netlify.com/api/v1/badges/f4103767-3263-42fd-84b6-4f85a240b208/deploy-status)](https://app.netlify.com/projects/zainee/deploys)

# Zainee & Mengal — Private Love World 💕

A private, romantic chat website for two people only: Zainee and Mengal. Includes secure login, real-time chat with magical animations, a Love Wall to save sweet notes forever, a surprise quotes button, a mini tic-tac-toe game, and a shared music corner with YouTube/Spotify embeds.

## Features
- Beautiful dreamy UI with soft gradient backgrounds and floating hearts/stars
- Secure login (session-based) restricted to 2 users
- Real-time chat with Socket.IO, typing indicator, heart-pop effect, love-style bubbles
- Love Wall with persistent notes (JSON file storage)
- Surprise button with random romantic quotes
- Mini-game: Tic-Tac-Toe
- Music corner: YouTube and Spotify embeds

## Tech Stack
- Node.js, Express, Socket.IO
- Sessions via `express-session`
- Security via `helmet` and login rate limiting
- Static front-end with vanilla JS, CSS animations

## Getting Started
1. Open a terminal and navigate to the project directory:
   - `C:\\Users\\Baba Mengal\\CascadeProjects\\zainee-mengal-love-chat`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from `.env.example` and set a strong `SESSION_SECRET` and your passwords for the two users.
4. Run the server:
   ```bash
   npm run start
   # or for auto-reload during development
   npm run dev
   ```
5. Open the app in your browser:
   - `http://localhost:3000`

## Default Pages
- `/login` — sign in as `Zainee` or `Mengal`
- `/home` — welcome page with the message "This world belongs only to Zainee & Mengal 💕"
- `/chat` — private real-time chat
- `/lovewall` — save your love notes forever
- `/game` — cute tic-tac-toe
- `/music` — shared music corner

## Notes Storage
Love Wall notes are saved to `data/notes.json`. This is a simple JSON file intended for personal use. For production deployment, consider a database.

## Security Tips
- Always configure strong passwords in `.env`
- Change `SESSION_SECRET` to a long random string
- When deploying, set `NODE_ENV=production` to enforce secure cookies

Enjoy your private love world! 💖
