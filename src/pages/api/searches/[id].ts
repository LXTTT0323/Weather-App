import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getSearchById,
  updateSearch,
  deleteSearch,
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

  // Get search ID from query
  const { id } = req.query;
  
  // Validate ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid search ID' });
  }
  
  const searchId = parseInt(id, 10);
  
  if (isNaN(searchId)) {
    return res.status(400).json({ error: 'Search ID must be a number' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get search by ID
        const search = await getSearchById(searchId);
        
        if (!search) {
          return res.status(404).json({ error: 'Search not found' });
        }
        
        return res.status(200).json(search);
        
      case 'PUT':
        // Update search
        const { location, latitude, longitude } = req.body;
        
        // Validate inputs
        if (!location || latitude === undefined || longitude === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if search exists
        const existingSearch = await getSearchById(searchId);
        
        if (!existingSearch) {
          return res.status(404).json({ error: 'Search not found' });
        }
        
        // Update the search
        const updatedSearch = await updateSearch(searchId, location, latitude, longitude);
        return res.status(200).json(updatedSearch);
        
      case 'DELETE':
        // Delete search
        const searchToDelete = await getSearchById(searchId);
        
        if (!searchToDelete) {
          return res.status(404).json({ error: 'Search not found' });
        }
        
        await deleteSearch(searchId);
        return res.status(200).json({ message: 'Search deleted successfully' });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 