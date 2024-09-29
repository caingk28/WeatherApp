// API key for Visual Crossing Weather API
const API_KEY = 'AFGQZPSGT7FPNEZKPXVQHZRY8'; // Replace with your actual API key

// Select DOM elements
const weatherForm = document.getElementById('weatherForm');
const locationInput = document.getElementById('locationInput');
const weatherInfo = document.getElementById('weatherInfo');
const loadingIndicator = document.getElementById('loading');

// Add event listener to the form
weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const location = locationInput.value.trim();
    if (location) {
        fetchWeatherData(location);
    }
});

// Function to fetch weather data
async function fetchWeatherData(location) {
    loadingIndicator.classList.remove('hidden');
    weatherInfo.innerHTML = '';

    try {
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${API_KEY}&contentType=json`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const processedData = processWeatherData(data);
        displayWeatherInfo(processedData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        handleError(error);
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

// Function to process the API response
function processWeatherData(data) {
    const currentConditions = data.currentConditions;
    return {
        location: data.resolvedAddress,
        current: {
            temperature: currentConditions.temp,
            description: currentConditions.conditions,
            humidity: currentConditions.humidity,
            windSpeed: currentConditions.windspeed,
            feelsLike: currentConditions.feelslike,
            uvIndex: currentConditions.uvindex,
            icon: getWeatherIcon(currentConditions.conditions)
        },
        forecast: data.days.slice(1, 6).map(day => ({
            date: new Date(day.datetime).toLocaleDateString(),
            maxTemp: day.tempmax,
            minTemp: day.tempmin,
            description: day.conditions,
            icon: getWeatherIcon(day.conditions)
        }))
    };
}

// Function to display weather information
function displayWeatherInfo(weatherData) {
    if (!weatherData) {
        console.error('Weather data is undefined');
        return;
    }

    let html = `
        <h2>Weather in ${weatherData.location}</h2>
        <div class="current-weather-card">
            <div class="weather-icon">
                <i class="fas ${weatherData.current.icon} fa-4x"></i>
            </div>
            <div class="current-weather-details">
                <h3>${weatherData.current.temperature}°C</h3>
                <p>${weatherData.current.description}</p>
                <p>Feels like: ${weatherData.current.feelsLike}°C</p>
                <p>Humidity: ${weatherData.current.humidity}%</p>
                <p>Wind Speed: ${weatherData.current.windSpeed} km/h</p>
                <p>UV Index: ${weatherData.current.uvIndex}</p>
            </div>
        </div>
        <h3>5-Day Forecast</h3>
        <div class="forecast-container">
    `;

    weatherData.forecast.forEach(day => {
        html += `
            <div class="forecast-day">
                <h4>${day.date}</h4>
                <div class="weather-icon">
                    <i class="fas ${day.icon} fa-2x"></i>
                </div>
                <p class="forecast-temp">${Math.round(day.minTemp)}°C - ${Math.round(day.maxTemp)}°C</p>
                <p class="forecast-desc">${day.description}</p>
            </div>
        `;
    });

    html += '</div>';
    weatherInfo.innerHTML = html;
}

function handleError(error) {
    let errorMessage = 'An error occurred while fetching weather data.';

    if (error instanceof TypeError) {
        errorMessage = 'Network error. Please check your internet connection.';
    } else if (error instanceof SyntaxError) {
        errorMessage = 'Error parsing weather data. Please try again later.';
    } else if (error.message.includes('HTTP error')) {
        errorMessage = 'Unable to fetch weather data. Please check if the location is valid.';
    }

    weatherInfo.innerHTML = `<p class="error">${errorMessage}</p>`;
}

function getWeatherIcon(condition) {
    const iconMap = {
        'clear': 'fa-sun',
        'sunny': 'fa-sun',
        'rain': 'fa-cloud-rain',
        'drizzle': 'fa-cloud-rain',
        'showers': 'fa-cloud-showers-heavy',
        'cloudy': 'fa-cloud',
        'overcast': 'fa-cloud',
        'partly-cloudy': 'fa-cloud-sun',
        'partly sunny': 'fa-cloud-sun',
        'mostly cloudy': 'fa-cloud-sun',
        'snow': 'fa-snowflake',
        'sleet': 'fa-snowflake',
        'flurries': 'fa-snowflake',
        'freezing rain': 'fa-icicles',
        'thunderstorm': 'fa-bolt',
        'storm': 'fa-bolt',
        'fog': 'fa-smog',
        'mist': 'fa-smog',
        'haze': 'fa-smog',
        'wind': 'fa-wind',
        'windy': 'fa-wind',
        'breezy': 'fa-wind',
        'tornado': 'fa-tornado',
        'hurricane': 'fa-hurricane',
        'tropical storm': 'fa-hurricane',
        'dust': 'fa-dust',
        'sandstorm': 'fa-dust',
        'hot': 'fa-temperature-high',
        'cold': 'fa-temperature-low',
        'frigid': 'fa-temperature-low',
        'frost': 'fa-icicles',
        'hail': 'fa-cloud-meatball'
    };

    const defaultIcon = 'fa-cloud';
    const lowerCondition = condition.toLowerCase();

    for (const [key, value] of Object.entries(iconMap)) {
        if (lowerCondition.includes(key)) {
            return value;
        }
    }

    return defaultIcon;
}