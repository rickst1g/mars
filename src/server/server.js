// Load environment variables
require('dotenv').config();
const express = require('express');
const roversRouter = require('./routes/rovers');
const bodyParser = require('body-parser');
const path = require('path');
const apodRouter = require('./routes/apod');

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON request bodies
app.use(bodyParser.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API route for rover data
app.use('/api/rovers', roversRouter);

// API route for apod data
app.use('/api/apod', apodRouter);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));