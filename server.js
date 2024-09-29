const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Oracle DB configuration
const dbConfig = {
  user: 'PROKANADM',            // Replace with your Oracle username
  password: 'PROKANADM',        // Replace with your Oracle password
  connectString: 'localhost/XE' // Default Oracle XE connection string
};

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM USERS WHERE EMAIL = :email`,
      [email]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    await connection.execute(
      `INSERT INTO USERS (EMAIL, PASSWORD) VALUES (:email, :password)`,
      [email, hashedPassword],
      { autoCommit: true }
    );

    res.status(201).json({ message: 'User registered successfully' });
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Check if user exists
    const result = await connection.execute(
      `SELECT * FROM USERS WHERE EMAIL = :email`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const userId = user[0];
    const storedPassword = user[2];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, storedPassword);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate JWT token
    const token = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Example protected route
app.get('/api/tasks', authMiddleware, async (req, res) => {
  // Retrieve tasks from Oracle XE database
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const tasks = await connection.execute(`SELECT * FROM TASKS WHERE USER_ID = :userId`, [req.user]);

    res.json(tasks.rows);
    await connection.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving tasks' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
