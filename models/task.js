const oracledb = require('oracledb');
const dbConfig = require('../config/dbConfig');

async function getTasksByUserId(userId) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT ID, TITLE, DESCRIPTION, COMPLETED FROM TASKS WHERE USER_ID = :userId`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row[0],
      title: row[1],
      description: row[2],
      completed: row[3] === 1
    }));
  } finally {
    if (connection) await connection.close();
  }
}

async function createTask(userId, title, description) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `INSERT INTO TASKS (USER_ID, TITLE, DESCRIPTION, COMPLETED) VALUES (:userId, :title, :description, 0)`,
      [userId, title, description],
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
}

async function updateTask(taskId, userId, title, description, completed) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `UPDATE TASKS SET TITLE = :title, DESCRIPTION = :description, COMPLETED = :completed WHERE ID = :taskId AND USER_ID = :userId`,
      [title, description, completed ? 1 : 0, taskId, userId],
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteTask(taskId, userId) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `DELETE FROM TASKS WHERE ID = :taskId AND USER_ID = :userId`,
      [taskId, userId],
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getTasksByUserId,
  createTask,
  updateTask,
  deleteTask
};
