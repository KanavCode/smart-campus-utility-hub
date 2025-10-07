const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- User Registration ---
const register = async (req, res) => {
  try {
    const { fullName, email, password, department } = req.body;

    // 1. Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert the new user into the database
    const newUserQuery = `
      INSERT INTO "Users" ("fullName", "email", "passwordHash", "department")
      VALUES ($1, $2, $3, $4)
      RETURNING id, "fullName", email, role, department;
    `;
    const values = [fullName, email, passwordHash, department];
    const { rows } = await db.query(newUserQuery, values);

    // 4. Send a success response
    res.status(201).json({
      message: 'User registered successfully!',
      user: rows[0],
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'An error occurred during registration.', error: error.message });
  }
};

// --- User Login ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // 2. Find the user by email
    const userQuery = 'SELECT * FROM "Users" WHERE email = $1';
    const { rows } = await db.query(userQuery, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 3. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. Create a JWT payload
    const payload = {
      id: user.id,
      role: user.role,
      department: user.department,
    };

    // 5. Sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d', // Token expires in 1 day
    });

    // 6. Send the token to the client
    res.status(200).json({
      message: 'Logged in successfully!',
      token: token,
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'An error occurred during login.', error: error.message });
  }
};
// --- Get Current User Profile ---
const getMe = async (req, res) => {
  try {
    // The user's ID is attached to req.user by the verifyToken middleware
    const userId = req.user.id;
    
    const userQuery = 'SELECT id, "fullName", email, role, department FROM "Users" WHERE id = $1';
    const { rows } = await db.query(userQuery, [userId]);

    if (rows.length === 0) {
       return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('GetMe Error:', error);
     res.status(500).json({ message: 'An error occurred while fetching user profile.' });
  }
};
module.exports = {
  register,
  login,
  getMe, // Add this here
};