const express = require('express');
const cors = require('cors');

// Import your new routes
const authRoutes = require('./api/routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the kirtan_space API!' });
});

// --- Main API Routes ---
// Any request starting with /api/auth will be handled by authRoutes
app.use('/api/auth', authRoutes);


module.exports = app;