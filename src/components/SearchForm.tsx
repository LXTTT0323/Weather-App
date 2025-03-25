import { useState } from 'react';
import axios from 'axios';
import { 
  getCoordinates, 
  getCurrentWeather, 
  getWeatherForecast, 
  getWeatherByCurrentPosition,
  getWeatherForDateRange
} from '@/services/weatherService';

// Define types for component props
interface SearchFormProps {
  setWeatherData: (data: any) => void;
  setForecastData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const SearchForm = ({ 
  setWeatherData, 
  setForecastData, 
  setLoading, 
  setError 
}: SearchFormProps) => {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  
  // Handle form submission for location search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get coordinates for the location
      const coords = await getCoordinates(location);

      // Save search to database
      const searchRecord = await saveSearchToDatabase(location, coords);

      if (showDateRange && startDate && endDate) {
        // Validate date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error('Invalid date format');
        }
        
        if (end < start) {
          throw new Error('End date must be after start date');
        }
        
        // Get weather for date range
        const rangeData = await getWeatherForDateRange(coords, startDate, endDate);
        
        // Save weather data to database
        await saveWeatherDataToDatabase(
          searchRecord.id,
          rangeData.data[0].temp,
          rangeData.data[0].temp - 2, // Mock feels_like
          70, // Mock humidity
          5, // Mock wind speed
          rangeData.data[0].description,
          '', // No icon for historical data
          startDate,
          endDate
        );
        
        // Set data for display
        setWeatherData({ 
          name: location,
          main: { temp: rangeData.data[0].temp },
          weather: [{ description: rangeData.data[0].description }],
          sys: { country: '' },
          dt: new Date().getTime() / 1000
        });
        setForecastData(null);
      } else {
        // Get current weather and forecast
        const currentWeather = await getCurrentWeather(coords);
        const forecastData = await getWeatherForecast(coords);

        // Save weather data to database
        if (searchRecord && searchRecord.id) {
          await saveWeatherDataToDatabase(
            searchRecord.id,
            currentWeather.main.temp,
            currentWeather.main.feels_like,
            currentWeather.main.humidity,
            currentWeather.wind.speed,
            currentWeather.weather[0].description,
            currentWeather.weather[0].icon
          );
        }

        // Update state with the fetched data
        setWeatherData(currentWeather);
        setForecastData(forecastData);
      }
      
      setError(null);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Error fetching weather data');
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  // Get weather for user's current location
  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const { current, forecast } = await getWeatherByCurrentPosition();
      
      // Save to database
      const searchRecord = await saveSearchToDatabase(
        `${current.name}, ${current.sys.country}`, 
        { lat: current.coord.lat, lon: current.coord.lon }
      );

      // Save weather data
      if (searchRecord && searchRecord.id) {
        await saveWeatherDataToDatabase(
          searchRecord.id,
          current.main.temp,
          current.main.feels_like,
          current.main.humidity,
          current.wind.speed,
          current.weather[0].description,
          current.weather[0].icon
        );
      }
      
      setWeatherData(current);
      setForecastData(forecast);
      setLocation(`${current.name}, ${current.sys.country}`);
    } catch (error) {
      console.error('Geolocation error:', error);
      setError(error instanceof Error ? error.message : 'Error getting current location');
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to save search to database
  const saveSearchToDatabase = async (location: string, coords: any) => {
    try {
      const response = await axios.post('/api/searches', {
        location,
        latitude: coords.lat,
        longitude: coords.lon
      });
      
      return response.data;
    } catch (error) {
      console.error('Error saving search to database:', error);
      // Non-critical error, continue with the weather display
      return null;
    }
  };

  // Function to save weather data to database
  const saveWeatherDataToDatabase = async (
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
    try {
      const response = await axios.post('/api/weather-data', {
        searchId,
        temperature,
        feelsLike,
        humidity,
        windSpeed,
        description,
        icon,
        dateStart,
        dateEnd
      });
      
      return response.data;
    } catch (error) {
      console.error('Error saving weather data to database:', error);
      // Non-critical error, continue with the weather display
      return null;
    }
  };

  // Validate date ranges
  const validateDateRange = () => {
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Search Weather</h2>
      <form onSubmit={handleSearch}>
        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 mb-2">
            Enter location (city, zip code, coordinates)
          </label>
          <input
            id="location"
            type="text"
            className="input-field w-full"
            placeholder="e.g., New York, 10001, or 40.7128,-74.0060"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center mb-4">
          <input
            id="date-range-toggle"
            type="checkbox"
            className="mr-2"
            checked={showDateRange}
            onChange={() => setShowDateRange(!showDateRange)}
          />
          <label htmlFor="date-range-toggle" className="text-gray-700">
            Specify date range (for historical data)
          </label>
        </div>

        {showDateRange && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="start-date" className="block text-gray-700 mb-2">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                className={`input-field w-full ${!validateDateRange() ? 'border-red-500' : ''}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required={showDateRange}
                max={new Date().toISOString().split('T')[0]} // Limit to today
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-gray-700 mb-2">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                className={`input-field w-full ${!validateDateRange() ? 'border-red-500' : ''}`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]} // Limit to today
                required={showDateRange}
              />
            </div>
            {!validateDateRange() && (
              <div className="col-span-2 text-red-500 text-sm">
                End date must be after start date
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={showDateRange && !validateDateRange()}
          >
            Search
          </button>
          <button
            type="button"
            className="btn btn-secondary flex-1"
            onClick={handleGetCurrentLocation}
          >
            Use My Location
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm; 