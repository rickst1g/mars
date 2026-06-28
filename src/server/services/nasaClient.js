// Set dependancies
const fetch = require('node-fetch');

// Assign value to variable
const NASA_IMAGES_API = 'https://images-api.nasa.gov/search';
//const NASA_PIC_OF_THE_DAY_API = 'https://api.nasa.gov/planetary/apod';   //?api_key=${process.env.API_KEY}`)

// Fetch rover images from NASA Images API
async function getRoverImages(rover) {
    // Assign value to variables
    const query = `${rover} rover`;    
    const url = `${NASA_IMAGES_API}?q=${encodeURIComponent(
        query
    )}&media_type=image`;

    const response = await fetch(url);
    const data = await response.json();
    const items = data.collection?.items || [];
    
    // Normalize NASA API response
    return items.map(item => {
        const d = item.data?.[0];
        const l = item.links?.[0];

        return {
        nasa_id: d?.nasa_id,
        title: d?.title,
        description: d?.description,
        thumb: l?.href        
        };
    });
}

module.exports = {
    getRoverImages
};