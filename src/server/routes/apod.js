// Set dependancies
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const apiKey = process.env.NASA_API_KEY;
const router = express.Router();

// Return photo of the day
router.get('/', async (req, res) => {
    // try statement to catch errors
    try {
        const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
        // Fetch images from NASA API
        const response = await fetch(url);
        const data = await response.json();
        // Return immutable response
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch APOD" });
    }
});

module.exports = router;