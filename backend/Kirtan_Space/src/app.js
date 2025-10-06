const express = require('express');
const cors = require('cors');

// Import your routes
const authRoutes = require('./api/routes/auth.routes');
const clubRoutes = require('./api/routes/clubs.routes');
const eventRoutes = require('./api/routes/events.routes'); // Import event routes

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the kirtan_space API!' });
});

// --- Main API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes); // Use the event routes

module.exports = app;