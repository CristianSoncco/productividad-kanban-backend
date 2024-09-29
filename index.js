const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// Import and apply routes
require('./src/server')(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});