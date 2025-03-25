import { NextApiRequest, NextApiResponse } from 'next';
import { getAllSearches, getWeatherDataBySearchId, initDB } from '@/database/dbService';

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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get export format from query
  const { format } = req.query;
  
  // Validate format
  if (!format || Array.isArray(format)) {
    return res.status(400).json({ error: 'Invalid export format' });
  }
  
  // Get search ID if provided
  const { searchId } = req.query;
  let parsedSearchId: number | undefined;
  
  if (searchId) {
    parsedSearchId = parseInt(searchId as string, 10);
    
    if (isNaN(parsedSearchId)) {
      return res.status(400).json({ error: 'Search ID must be a number' });
    }
  }

  try {
    // Get data to export
    let exportData;
    
    if (parsedSearchId) {
      // Get weather data for a specific search
      const weatherData = await getWeatherDataBySearchId(parsedSearchId);
      exportData = { weatherData };
    } else {
      // Get all searches and their weather data
      const searches = await getAllSearches();
      const weatherDataBySearch = await Promise.all(
        searches.map(async (search) => {
          const weatherData = await getWeatherDataBySearchId(search.id);
          return { ...search, weatherData };
        })
      );
      exportData = { searches: weatherDataBySearch };
    }

    // Export based on format
    switch (format.toLowerCase()) {
      case 'json':
        // Return as JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=weather-data.json');
        return res.status(200).json(exportData);
        
      case 'xml':
        // Convert to XML
        const xml = convertToXML(exportData);
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', 'attachment; filename=weather-data.xml');
        return res.status(200).send(xml);
        
      case 'csv':
        // Convert to CSV
        const csv = convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=weather-data.csv');
        return res.status(200).send(csv);
        
      case 'markdown':
      case 'md':
        // Convert to Markdown
        const markdown = convertToMarkdown(exportData);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', 'attachment; filename=weather-data.md');
        return res.status(200).send(markdown);
        
      default:
        return res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Error exporting data' });
  }
}

// Helper function to convert data to XML
function convertToXML(data: any): string {
  // Simple XML conversion - in a real app, use a proper XML library
  const convertObjectToXML = (obj: any, name: string): string => {
    if (obj === null || obj === undefined) {
      return `<${name}></${name}>`;
    }
    
    if (typeof obj !== 'object') {
      return `<${name}>${obj}</${name}>`;
    }
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        convertObjectToXML(item, `${name.endsWith('s') ? name.slice(0, -1) : name}`)
      ).join('');
    }
    
    let xml = `<${name}>`;
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        xml += convertObjectToXML(obj[key], key);
      }
    }
    
    xml += `</${name}>`;
    return xml;
  };
  
  return `<?xml version="1.0" encoding="UTF-8"?>${convertObjectToXML(data, 'weatherData')}`;
}

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  if (data.weatherData) {
    // Export weather data for a single search
    const { weatherData } = data;
    
    if (!weatherData || weatherData.length === 0) {
      return 'No weather data found';
    }
    
    // Get headers from first item
    const headers = Object.keys(weatherData[0]).join(',');
    
    // Convert each item to CSV row
    const rows = weatherData.map((item: any) => 
      Object.values(item).map(value => {
        // Handle values with commas by quoting them
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  } else if (data.searches) {
    // Export all searches
    const { searches } = data;
    
    if (!searches || searches.length === 0) {
      return 'No searches found';
    }
    
    // Create CSV with location, coordinates, and weather info
    const headers = 'id,location,latitude,longitude,temperature,humidity,description,date';
    
    const rows = searches.flatMap((search: any) => {
      if (!search.weatherData || search.weatherData.length === 0) {
        return [`${search.id},"${search.location}",${search.latitude},${search.longitude},,,,`];
      }
      
      return search.weatherData.map((weather: any) => [
        search.id,
        `"${search.location}"`,
        search.latitude,
        search.longitude,
        weather.temperature,
        weather.humidity,
        `"${weather.description || ''}"`,
        weather.created_at
      ].join(','));
    });
    
    return [headers, ...rows].join('\n');
  }
  
  return 'No data to export';
}

// Helper function to convert data to Markdown
function convertToMarkdown(data: any): string {
  let markdown = '# Weather Data Export\n\n';
  
  if (data.weatherData) {
    // Export weather data for a single search
    const { weatherData } = data;
    
    if (!weatherData || weatherData.length === 0) {
      return markdown + 'No weather data found';
    }
    
    // Create table headers
    const headers = Object.keys(weatherData[0]);
    markdown += `| ${headers.join(' | ')} |\n`;
    markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
    
    // Add table rows
    weatherData.forEach((item: any) => {
      markdown += `| ${Object.values(item).map(value => {
        if (value === null || value === undefined) return '';
        return String(value).replace(/\|/g, '\\|');
      }).join(' | ')} |\n`;
    });
  } else if (data.searches) {
    // Export all searches
    const { searches } = data;
    
    if (!searches || searches.length === 0) {
      return markdown + 'No searches found';
    }
    
    // Create search sections with weather data
    searches.forEach((search: any) => {
      markdown += `## ${search.location}\n\n`;
      markdown += `- **ID**: ${search.id}\n`;
      markdown += `- **Coordinates**: ${search.latitude}, ${search.longitude}\n`;
      markdown += `- **Created At**: ${search.created_at}\n\n`;
      
      if (!search.weatherData || search.weatherData.length === 0) {
        markdown += 'No weather data available for this location.\n\n';
        return;
      }
      
      markdown += '### Weather Data\n\n';
      
      // Create table headers
      const headers = Object.keys(search.weatherData[0]);
      markdown += `| ${headers.join(' | ')} |\n`;
      markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
      
      // Add table rows
      search.weatherData.forEach((weather: any) => {
        markdown += `| ${Object.values(weather).map(value => {
          if (value === null || value === undefined) return '';
          return String(value).replace(/\|/g, '\\|');
        }).join(' | ')} |\n`;
      });
      
      markdown += '\n';
    });
  }
  
  return markdown;
} 