const express = require('express');
const { getTasksByUserId, createTask, updateTask, deleteTask } = require('../models/Task');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate user via JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key'); // Ensure this matches your auth.js secret
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await getTasksByUserId(req.userId);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving tasks' });
  }
});

// POST /api/tasks - Create a new task for authenticated user
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  try {
    await createTask(req.userId, title, description);
    res.status(201).json({ message: 'Task created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  try {
    await updateTask(id, req.userId, title, description, completed);
    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await deleteTask(id, req.userId);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;
