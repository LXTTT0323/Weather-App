# Weather App

A comprehensive weather application that provides current weather information and forecasts for any location. 

## Features

### Tech Assessment 1 Features
- Search for weather by location (city, zip code, coordinates)
- View current weather conditions with detailed information
- 5-day weather forecast
- Geolocation for current position weather
- Clean, responsive UI with weather icons

### Tech Assessment 2 Features
- Database storage for weather searches and results
- CRUD operations for saved weather data
- Location validation
- Date range selection for weather forecasts
- Google Maps integration
- Data export functionality

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/weather-app.git
cd weather-app
```

2. Install dependencies:
```
npm install
```

3. Create a `.env.local` file in the root directory and add your API keys:
```
OPENWEATHER_API_KEY=your_openweather_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Run the development server:
```
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Technologies Used

- Next.js and React for frontend
- Node.js with Express for backend
- SQLite for database
- Tailwind CSS for styling
- OpenWeatherMap API for weather data
- Google Maps API for location visualization

## Project Structure

```
weather-app/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Next.js pages
│   ├── styles/          # CSS styles
│   ├── utils/           # Utility functions
│   ├── api/             # API routes
│   ├── services/        # External service integrations
│   └── database/        # Database models and operations
├── public/              # Static assets
├── .env.local           # Environment variables (create this)
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## Requirements

- Node.js 14.x or higher
- npm 7.x or higher

## Author

Tao Li

## License

MIT 