import { useState, useEffect } from 'react';
import Head from 'next/head';
import SearchForm from '@/components/SearchForm';
import CurrentWeather from '@/components/CurrentWeather';
import ForecastWeather from '@/components/ForecastWeather';
import SavedSearches from '@/components/SavedSearches';
import InfoButton from '@/components/InfoButton';

export default function Home() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Weather App</title>
        <meta name="description" content="Weather App - Get current and forecast weather for any location" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Weather App</h1>
            <InfoButton />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <SearchForm 
                setWeatherData={setWeatherData}
                setForecastData={setForecastData}
                setLoading={setLoading}
                setError={setError}
              />
              <SavedSearches 
                setWeatherData={setWeatherData}
                setForecastData={setForecastData}
                setLoading={setLoading}
                setError={setError}
              />
            </div>
            <div className="lg:col-span-2">
              {loading && (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded mb-4">
                  <p>{error}</p>
                </div>
              )}

              {weatherData && !loading && (
                <CurrentWeather weatherData={weatherData} />
              )}

              {forecastData && !loading && (
                <ForecastWeather forecastData={forecastData} />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 