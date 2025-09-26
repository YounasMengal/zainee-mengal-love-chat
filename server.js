require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, FRONTEND_ORIGIN ? { cors: { origin: FRONTEND_ORIGIN, credentials: true } } : {});

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://www.gstatic.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "connect-src": ["'self'"],
      "frame-src": ["'self'", "https://www.youtube.com", "https://open.spotify.com"],
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for split front-end/back-end deployments
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';
if (FRONTEND_ORIGIN) {
  app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
}

// Sessions
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_change_me';
const USE_CROSS_SITE = process.env.USE_CROSS_SITE === '1';
app.use(session({
  name: 'love.sess',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: USE_CROSS_SITE ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts. Please try again later.'
});

// Users from .env
const USER1_NAME = process.env.USER1_NAME || 'Zainee';
const USER1_PASSWORD = process.env.USER1_PASSWORD || 'love12345';
const USER2_NAME = process.env.USER2_NAME || 'Mengal';
const USER2_PASSWORD = process.env.USER2_PASSWORD || 'love12345';

// Hash passwords at startup (in-memory)
const users = {};
users[USER1_NAME] = { username: USER1_NAME, hash: bcrypt.hashSync(USER1_PASSWORD, 10) };
users[USER2_NAME] = { username: USER2_NAME, hash: bcrypt.hashSync(USER2_PASSWORD, 10) };

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user && users[req.session.user]) return next();
  return res.redirect('/login');
}

// Serve static assets
app.use('/static', express.static(path.join(__dirname, 'public')));

// Pages
app.get('/', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/home');
  return res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = username;
  return res.json({ ok: true, redirect: '/home' });
});

app.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('love.sess');
    res.json({ ok: true, redirect: '/login' });
  });
});

app.get('/home', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/lovewall', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lovewall.html'));
});

app.get('/game', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

app.get('/music', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'music.html'));
});

// Love Wall storage (configurable for production persistence)
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(NOTES_FILE)) fs.writeFileSync(NOTES_FILE, JSON.stringify([] , null, 2));

function readNotes() {
  try {
    return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

app.get('/api/notes', requireAuth, (req, res) => {
  res.json(readNotes());
});

app.post('/api/notes', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Note cannot be empty' });
  const notes = readNotes();
  const newNote = { id: Date.now(), text: text.trim(), by: req.session.user, at: new Date().toISOString() };
  notes.unshift(newNote);
  writeNotes(notes);
  res.json({ ok: true, note: newNote });
});

app.delete('/api/notes/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const notes = readNotes();
  const filtered = notes.filter(n => n.id !== id);
  writeNotes(filtered);
  res.json({ ok: true });
});

// Socket.IO for chat
io.use((socket, next) => {
  // Trust session user from query (client attaches after login)
  const username = socket.handshake.auth && socket.handshake.auth.username;
  if (!username || !users[username]) return next(new Error('Unauthorized'));
  socket.username = username;
  next();
});

const connectedUsers = new Set();

io.on('connection', (socket) => {
  connectedUsers.add(socket.username);
  io.emit('presence', Array.from(connectedUsers));

  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', { user: socket.username, isTyping });
  });

  socket.on('message', (msg) => {
    const payload = { id: Date.now(), user: socket.username, text: msg, time: new Date().toISOString() };
    io.emit('message', payload);
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.username);
    io.emit('presence', Array.from(connectedUsers));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Love server running on http://localhost:${PORT}`);
});
