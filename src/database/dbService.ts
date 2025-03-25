import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Define database path
const dbPath = path.resolve(process.cwd(), 'weather-data.sqlite');

// Initialize database
export const initDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS weather_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_id INTEGER NOT NULL,
      temperature REAL NOT NULL,
      feels_like REAL,
      humidity INTEGER,
      wind_speed REAL,
      description TEXT,
      icon TEXT,
      date_start TEXT,
      date_end TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (search_id) REFERENCES searches (id) ON DELETE CASCADE
    )
  `);

  return db;
};

// Get database connection
export const getDB = async () => {
  return await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
};

// CRUD Operations for Searches

// Create a new search record
export const createSearch = async (location: string, latitude: number, longitude: number) => {
  const db = await getDB();
  
  try {
    const result = await db.run(
      'INSERT INTO searches (location, latitude, longitude) VALUES (?, ?, ?)',
      [location, latitude, longitude]
    );
    
    return {
      id: result.lastID,
      location,
      latitude,
      longitude,
      created_at: new Date().toISOString(),
    };
  } finally {
    await db.close();
  }
};

// Read all searches
export const getAllSearches = async () => {
  const db = await getDB();
  
  try {
    return await db.all('SELECT * FROM searches ORDER BY created_at DESC');
  } finally {
    await db.close();
  }
};

// Read a single search by ID
export const getSearchById = async (id: number) => {
  const db = await getDB();
  
  try {
    return await db.get('SELECT * FROM searches WHERE id = ?', [id]);
  } finally {
    await db.close();
  }
};

// Update a search
export const updateSearch = async (id: number, location: string, latitude: number, longitude: number) => {
  const db = await getDB();
  
  try {
    await db.run(
      'UPDATE searches SET location = ?, latitude = ?, longitude = ? WHERE id = ?',
      [location, latitude, longitude, id]
    );
    
    return await getSearchById(id);
  } finally {
    await db.close();
  }
};

// Delete a search
export const deleteSearch = async (id: number) => {
  const db = await getDB();
  
  try {
    await db.run('DELETE FROM searches WHERE id = ?', [id]);
    return true;
  } finally {
    await db.close();
  }
};

// CRUD Operations for Weather Data

// Create weather data record
export const createWeatherData = async (
  searchId: number,
  temperature: number,
  feelsLike: number,
  humidity: number,
  windSpeed: number,
  description: string,
  icon: string,
  dateStart?: string,
  dateEnd?: string
) => {
  const db = await getDB();
  
  try {
    const result = await db.run(
      `INSERT INTO weather_data 
       (search_id, temperature, feels_like, humidity, wind_speed, description, icon, date_start, date_end) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [searchId, temperature, feelsLike, humidity, windSpeed, description, icon, dateStart, dateEnd]
    );
    
    return {
      id: result.lastID,
      search_id: searchId,
      temperature,
      feels_like: feelsLike,
      humidity,
      wind_speed: windSpeed,
      description,
      icon,
      date_start: dateStart,
      date_end: dateEnd,
      created_at: new Date().toISOString(),
    };
  } finally {
    await db.close();
  }
};

// Get weather data by search ID
export const getWeatherDataBySearchId = async (searchId: number) => {
  const db = await getDB();
  
  try {
    return await db.all('SELECT * FROM weather_data WHERE search_id = ? ORDER BY created_at DESC', [searchId]);
  } finally {
    await db.close();
  }
};

// Update weather data
export const updateWeatherData = async (
  id: number,
  temperature: number,
  feelsLike: number,
  humidity: number,
  windSpeed: number,
  description: string,
  icon: string,
  dateStart?: string,
  dateEnd?: string
) => {
  const db = await getDB();
  
  try {
    await db.run(
      `UPDATE weather_data 
       SET temperature = ?, feels_like = ?, humidity = ?, wind_speed = ?, 
       description = ?, icon = ?, date_start = ?, date_end = ?
       WHERE id = ?`,
      [temperature, feelsLike, humidity, windSpeed, description, icon, dateStart, dateEnd, id]
    );
    
    return await db.get('SELECT * FROM weather_data WHERE id = ?', [id]);
  } finally {
    await db.close();
  }
};

// Delete weather data
export const deleteWeatherData = async (id: number) => {
  const db = await getDB();
  
  try {
    await db.run('DELETE FROM weather_data WHERE id = ?', [id]);
    return true;
  } finally {
    await db.close();
  }
}; 