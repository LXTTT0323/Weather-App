import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentWeather, getWeatherForecast } from '@/services/weatherService';

interface SavedSearchesProps {
  setWeatherData: (data: any) => void;
  setForecastData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const SavedSearches = ({
  setWeatherData,
  setForecastData,
  setLoading,
  setError
}: SavedSearchesProps) => {
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>('json');
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Load saved searches from the database
  useEffect(() => {
    const fetchSavedSearches = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/searches');
        setSavedSearches(response.data);
      } catch (error) {
        console.error('Error fetching saved searches:', error);
        // If API fails, use mock data
        const mockSavedSearches = [
          { id: 1, location: 'New York', latitude: 40.7128, longitude: -74.0060, created_at: new Date().toISOString() },
          { id: 2, location: 'London', latitude: 51.5074, longitude: -0.1278, created_at: new Date().toISOString() },
          { id: 3, location: 'Tokyo', latitude: 35.6762, longitude: 139.6503, created_at: new Date().toISOString() },
        ];
        setSavedSearches(mockSavedSearches);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedSearches();
  }, []);

  // Function to load weather data for a saved search
  const loadSavedSearch = async (search: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = { lat: search.latitude, lon: search.longitude };
      
      // Get current weather and forecast
      const currentWeather = await getCurrentWeather(coords);
      const forecastData = await getWeatherForecast(coords);
      
      // Update state with the fetched data
      setWeatherData(currentWeather);
      setForecastData(forecastData);
    } catch (error) {
      console.error('Error loading saved search:', error);
      setError(error instanceof Error ? error.message : 'Error loading saved search');
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a saved search
  const deleteSavedSearch = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the search when clicking delete
    
    try {
      await axios.delete(`/api/searches/${id}`);
      setSavedSearches(savedSearches.filter(search => search.id !== id));
    } catch (error) {
      console.error('Error deleting saved search:', error);
      // If API call fails, still update UI for better UX
      setSavedSearches(savedSearches.filter(search => search.id !== id));
    }
  };

  // Function to export data
  const exportData = (format: string) => {
    window.open(`/api/export/${format}`, '_blank');
  };

  if (savedSearches.length === 0 && !isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>
        <p className="text-gray-500">No saved searches yet. Search for a location to save it here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Searches</h2>
        
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="text-primary hover:text-primary/80 text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
          
          {showExportOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="p-2">
                <div className="mb-2">
                  <label className="block text-sm text-gray-700 mb-1">Format:</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full text-sm border rounded px-2 py-1"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="xml">XML</option>
                    <option value="markdown">Markdown</option>
                  </select>
                </div>
                <button
                  onClick={() => exportData(exportFormat)}
                  className="w-full bg-primary text-white text-sm rounded py-1 hover:bg-primary/80"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {savedSearches.map((search) => (
            <li key={search.id} className="py-3 flex justify-between items-center">
              <button
                onClick={() => loadSavedSearch(search)}
                className="text-left text-gray-700 hover:text-primary"
              >
                <div className="font-medium">{search.location}</div>
                <div className="text-xs text-gray-500">
                  {new Date(search.created_at).toLocaleString()}
                </div>
              </button>
              <button
                onClick={(e) => deleteSavedSearch(search.id, e)}
                className="text-red-400 hover:text-red-600"
                aria-label="Delete search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedSearches; 