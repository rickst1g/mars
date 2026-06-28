// Set dependancies
const express = require('express');
const { Map } = require('immutable');
const { getRoverImages } = require('../services/nasaClient');

// Setup express router
const router = express.Router();

// Return NASA rover images for a given rover name
router.get('/:rover', async (req, res) => {
    // try statement to catch errors
    try {
        const { rover } = req.params;
        const validRovers = ['Curiosity', 'Opportunity', 'Spirit'];

        // Validate rover name
        if (!validRovers.includes(rover)) {
            return res.status(400).json({ error: 'Invalid rover name' });
        }        
        
        // Fetch images from NASA API
        const photos = await getRoverImages(rover);

        // Return immutable response
        res.json(
            Map({
                rover,
                photos
            })
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch rover images' });
    }
});

module.exports = router;