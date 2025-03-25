import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Types for TypeScript
export interface GeoLocation {
  lat: number;
  lon: number;
}

export interface WeatherData {
  id: number;
  main: string;
  description: string;
  icon: string;
}

// Get coordinates from location name, zip code, etc.
export const getCoordinates = async (location: string): Promise<GeoLocation> => {
  try {
    // Check if input is likely coordinates
    const coordsRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    
    if (coordsRegex.test(location)) {
      const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()));
      return { lat, lon };
    }
    
    // Check if input is a zip code
    const zipRegex = /^\d{5}(-\d{4})?$/;
    
    if (zipRegex.test(location)) {
      // Add the country code 'us' for US zip codes
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/zip?zip=${location},us&appid=${API_KEY}`
      );
      
      return {
        lat: response.data.lat,
        lon: response.data.lon
      };
    }
    
    // Otherwise, treat as city name
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`
    );
    
    if (!response.data || response.data.length === 0) {
      throw new Error('Location not found');
    }
    
    return {
      lat: response.data[0].lat,
      lon: response.data[0].lon
    };
  } catch (error) {
    // Improved error handling with more specific messages
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error('Location not found. Please check your input and try again.');
      } else if (error.response.status === 401) {
        throw new Error('API authentication failed. Please check your API key.');
      }
    }
    console.error('Error getting coordinates:', error);
    throw new Error('Unable to find coordinates for the provided location. Please try a different location format.');
  }
};

// Get current weather by coordinates
export const getCurrentWeather = async (coords: GeoLocation) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw new Error('Unable to fetch current weather data');
  }
};

// Get 5-day forecast by coordinates
export const getWeatherForecast = async (coords: GeoLocation) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw new Error('Unable to fetch weather forecast data');
  }
};

// Get weather for date range (Tech Assessment 2)
export const getWeatherForDateRange = async (coords: GeoLocation, startDate: string, endDate: string) => {
  try {
    // NOTE: OpenWeatherMap's free API doesn't support historical data
    // For demonstration purposes, we'll use a stubbed implementation
    // In a real app, you'd need to use their paid historical data API or a different provider
    
    const current = await getCurrentWeather(coords);
    
    return {
      location: current.name,
      coordinates: coords,
      startDate,
      endDate,
      data: [
        { date: startDate, temp: current.main.temp, description: current.weather[0].description }
        // In a real implementation, we'd have data for each day in the range
      ]
    };
  } catch (error) {
    console.error('Error fetching weather for date range:', error);
    throw new Error('Unable to fetch weather data for the specified date range');
  }
};

// Get weather by user's current position
export const getWeatherByCurrentPosition = async (): Promise<{ current: any, forecast: any }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          
          const currentWeather = await getCurrentWeather(coords);
          const forecastWeather = await getWeatherForecast(coords);
          
          resolve({
            current: currentWeather,
            forecast: forecastWeather
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(new Error(`Error getting current position: ${error.message}`));
      }
    );
  });
}; 