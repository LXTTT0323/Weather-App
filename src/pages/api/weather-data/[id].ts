import { NextApiRequest, NextApiResponse } from 'next';
import { 
  updateWeatherData,
  deleteWeatherData,
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

  // Get weather data ID from query
  const { id } = req.query;
  
  // Validate ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid weather data ID' });
  }
  
  const weatherDataId = parseInt(id, 10);
  
  if (isNaN(weatherDataId)) {
    return res.status(400).json({ error: 'Weather data ID must be a number' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        // Update weather data
        const { 
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
        if (temperature === undefined) {
          return res.status(400).json({ error: 'Temperature is required' });
        }
        
        // Update weather data
        const updatedWeatherData = await updateWeatherData(
          weatherDataId,
          temperature,
          feelsLike,
          humidity,
          windSpeed,
          description,
          icon,
          dateStart,
          dateEnd
        );
        
        if (!updatedWeatherData) {
          return res.status(404).json({ error: 'Weather data not found' });
        }
        
        return res.status(200).json(updatedWeatherData);
        
      case 'DELETE':
        // Delete weather data
        await deleteWeatherData(weatherDataId);
        return res.status(200).json({ message: 'Weather data deleted successfully' });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 