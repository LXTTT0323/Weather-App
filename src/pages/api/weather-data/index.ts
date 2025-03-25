import { NextApiRequest, NextApiResponse } from 'next';
import { 
  createWeatherData, 
  getWeatherDataBySearchId,
  initDB 
} from '@/database/dbService';

// Initialize the database on first request
let dbInitialized = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize database if not already done
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return res.status(500).json({ error: 'Failed to initialize database' });
    }
  }

  try {
    switch (req.method) {
      case 'POST':
        // Create new weather data
        const { 
          searchId, 
          temperature, 
          feelsLike, 
          humidity, 
          windSpeed, 
          description, 
          icon,
          dateStart,
          dateEnd
        } = req.body;
        
        // Validate required fields
        if (!searchId || temperature === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create weather data
        const newWeatherData = await createWeatherData(
          searchId,
          temperature,
          feelsLike,
          humidity,
          windSpeed,
          description,
          icon,
          dateStart,
          dateEnd
        );
        
        return res.status(201).json(newWeatherData);
        
      case 'GET':
        // Get weather data by search ID
        const { searchId: querySearchId } = req.query;
        
        if (!querySearchId) {
          return res.status(400).json({ error: 'Search ID is required' });
        }
        
        const parsedSearchId = parseInt(querySearchId as string, 10);
        
        if (isNaN(parsedSearchId)) {
          return res.status(400).json({ error: 'Search ID must be a number' });
        }
        
        const weatherData = await getWeatherDataBySearchId(parsedSearchId);
        return res.status(200).json(weatherData);
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 