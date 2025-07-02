import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import client from './caching.js';
import error from 'console';
const app = express();
const PORT = 3000;
dotenv.config();

const API_KEY = process.env.API_KEY;
app.get('/weather',async(req,res) => {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'City is required' });
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${API_KEY}&contentType=json`;
    
    try{
        const cachekey = `weather:${city}`;
        const cacheddata = await client.get(cachekey);
        if(cacheddata){
            console.log('serving from cached data')
            return res.json(JSON.parse(cacheddata));
        }
        const response =  await axios.get(url);
        const today = response.data.days[0]; // today’s weather data
        const temp = today.temp;             // average temperature
        const tempMax = today.tempmax;       // max temp
        const tempMin = today.tempmin;       // min temp
        
        await client.setEx(cachekey,3600,JSON.stringify({
            city: response.data.resolvedAddress,
            date: today.datetime,
            temperature: {
                average: temp,
                max: tempMax,
                min: tempMin
            }
        }));
        console.log('serving from web api and saving the cache');

        res.json({
            city: response.data.resolvedAddress,
            date: today.datetime,
            temperature: {
                average: temp,
                max: tempMax,
                min: tempMin
            }
        });

    }
    catch{
        res.status(500).json({error:'failed to fetch data' });
    }
}

)
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});