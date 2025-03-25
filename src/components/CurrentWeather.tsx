import Image from 'next/image';

interface CurrentWeatherProps {
  weatherData: any;
}

const CurrentWeather = ({ weatherData }: CurrentWeatherProps) => {
  if (!weatherData) return null;

  const {
    name = 'Unknown Location',
    sys = {},
    main = {},
    weather = [{ description: 'No data', icon: '01d' }],
    wind = { speed: 0 },
    visibility = 0,
    dt = Date.now() / 1000,
  } = weatherData;

  // Format date and time
  const date = new Date(dt * 1000);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Convert temperature from Celsius to Fahrenheit
  const temp = main.temp || 0;
  const tempF = (temp * 9/5) + 32;
  const feelsLike = main.feels_like || 0;
  const feelsLikeF = (feelsLike * 9/5) + 32;
  
  // Convert visibility from meters to miles (safely)
  const visibilityMiles = Math.round(((visibility || 0) / 1609) * 10) / 10;

  // Wind speed from m/s to mph (safely check if wind exists)
  const windSpeedMph = Math.round(((wind?.speed || 0) * 2.237) * 10) / 10;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="bg-primary text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {name}{sys.country ? `, ${sys.country}` : ''}
          </h2>
          <div className="text-sm">
            {formattedDate} <br />
            {formattedTime}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4">
              <img
                src={`https://openweathermap.org/img/wn/${weather[0]?.icon || '01d'}@2x.png`}
                alt={weather[0]?.description || 'Weather'}
                width={80}
                height={80}
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold">
                {Math.round(temp)}°C / {Math.round(tempF)}°F
              </h3>
              <p className="text-gray-500 capitalize">{weather[0]?.description || 'No data'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Feels Like:</span>
              <span>{Math.round(feelsLike)}°C / {Math.round(feelsLikeF)}°F</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Humidity:</span>
              <span>{main.humidity || 0}%</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Wind:</span>
              <span>{windSpeedMph} mph</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Pressure:</span>
              <span>{main.pressure || 'N/A'} hPa</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Visibility:</span>
              <span>{visibilityMiles} miles</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Min/Max:</span>
              <span>{Math.round(main.temp_min || temp)}°/{Math.round(main.temp_max || temp)}°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather; 