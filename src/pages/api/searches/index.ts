import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getAllSearches, 
  createSearch,
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

  // Handle different HTTP methods
  try {
    switch (req.method) {
      case 'GET':
        // Get all searches
        const searches = await getAllSearches();
        return res.status(200).json(searches);
        
      case 'POST':
        // Create a new search
        const { location, latitude, longitude } = req.body;
        
        // Validate inputs
        if (!location || latitude === undefined || longitude === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create the search
        const newSearch = await createSearch(location, latitude, longitude);
        return res.status(201).json(newSearch);
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 