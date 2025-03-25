import React from 'react';

interface ForecastWeatherProps {
  forecastData: any;
}

const ForecastWeather = ({ forecastData }: ForecastWeatherProps) => {
  if (!forecastData || !forecastData.list) return null;

  // Group forecast data by day
  const dailyForecasts = groupForecastsByDay(forecastData.list);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-primary text-white p-4">
        <h2 className="text-xl font-bold">5-Day Forecast</h2>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {Object.entries(dailyForecasts).map(([date, forecasts]: [string, any[]], index) => {
            // Use the mid-day forecast (closest to 12:00) as the representative for the day
            const middayForecast = findMiddayForecast(forecasts);
            
            // Skip if no forecast found for mid-day
            if (!middayForecast) return null;

            const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Calculate min and max temps for the day
            const tempMin = Math.round(Math.min(...forecasts.map(f => f.main.temp_min)));
            const tempMax = Math.round(Math.max(...forecasts.map(f => f.main.temp_max)));
            
            return (
              <div key={date} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="font-bold">{day}</div>
                <div className="text-sm text-gray-500 mb-2">{formattedDate}</div>
                
                <div className="flex justify-center mb-2">
                  <img 
                    src={`https://openweathermap.org/img/wn/${middayForecast.weather[0].icon}.png`} 
                    alt={middayForecast.weather[0].description}
                    width={40}
                    height={40}
                  />
                </div>
                
                <div className="text-sm capitalize mb-2">{middayForecast.weather[0].description}</div>
                
                <div className="flex justify-center items-center space-x-1">
                  <span className="font-bold">{tempMax}°</span>
                  <span className="text-gray-500 text-sm">{tempMin}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Group forecast data by day (YYYY-MM-DD)
const groupForecastsByDay = (forecastList: any[]) => {
  return forecastList.reduce((groups: any, forecast: any) => {
    const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(forecast);
    return groups;
  }, {});
};

// Find forecast closest to 12:00 noon
const findMiddayForecast = (forecasts: any[]) => {
  if (!forecasts.length) return null;
  
  return forecasts.reduce((closest, forecast) => {
    const forecastHour = new Date(forecast.dt * 1000).getHours();
    const closestHour = closest ? new Date(closest.dt * 1000).getHours() : 0;
    
    const forecastDiff = Math.abs(forecastHour - 12);
    const closestDiff = Math.abs(closestHour - 12);
    
    return forecastDiff < closestDiff ? forecast : closest;
  }, null);
};

export default ForecastWeather; 