class WeatherApp {
    constructor() {
        this.apiKey = "a722fdf37dc5dcbe9f831dd8326dd09a";
        this.currentUnit = "metric";
        this.weatherData = null;
        
        // DOM Elements
        this.elements = {
            locationInput: document.getElementById("location"),
            searchBtn: document.querySelector(".search-btn"),
            locationBtn: document.querySelector(".location-btn"),
            unitToggle: document.querySelector(".unit-toggle"),
            cityName: document.querySelector(".city-name"),
            todayDate: document.querySelector(".today-date"),
            currentTime: document.querySelector(".current-time"),
            currentTemp: document.querySelector(".current-temperature"),
            weatherIcon: document.querySelector(".weather-icon"),
            cloudType: document.querySelector(".cloud-type"),
            feelsLike: document.querySelector(".feels-like"),
            humidity: document.querySelector(".humidity"),
            windSpeed: document.querySelector(".wind-speed"),
            pressure: document.querySelector(".pressure"),
            forecastContainer: document.querySelector(".forecast-cards"),
            videoBackground: document.getElementById("weatherVideo")
        };
        
        this.init();
    }
    
    init() {
        // Event Listeners
        document.querySelector(".locationForm").addEventListener("submit", (e) => {
            e.preventDefault();
            this.fetchWeather(this.elements.locationInput.value);
        });
        
        this.elements.locationBtn.addEventListener("click", () => this.getLocationWeather());
        this.elements.unitToggle.addEventListener("click", () => this.toggleUnits());
        
        // Set video based on time of day
        this.setVideoBackground();
        
        // Load default weather
        this.fetchWeather("London");
    }
    
    setVideoBackground() {
        const hour = new Date().getHours();
        let videoUrl;
        
        if (hour >= 6 && hour < 18) {
            // Daytime
            videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-blue-sky-with-clouds-1257-large.mp4";
        } else {
            // Nighttime
            videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-stars-1337-large.mp4";
        }
        
        this.elements.videoBackground.src = videoUrl;
    }
    
    toggleUnits() {
        this.currentUnit = this.currentUnit === "metric" ? "imperial" : "metric";
        if (this.weatherData) {
            this.displayWeather(this.weatherData);
        }
    }
    
    getLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    this.fetchWeatherByCoords(latitude, longitude);
                },
                error => {
                    alert("Unable to retrieve your location. Please enable location services or search manually.");
                    console.error(error);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }
    
    async fetchWeather(location) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${this.apiKey}&units=${this.currentUnit}`
            );
            
            if (!response.ok) {
                throw new Error("City not found");
            }
            
            const data = await response.json();
            const forecast = await this.fetchForecast(data.coord.lat, data.coord.lon);
            
            this.weatherData = { current: data, forecast };
            this.displayWeather(this.weatherData);
            
            // Change video based on weather condition
            this.adjustVideoForWeather(data.weather[0].main);
        } catch (error) {
            alert(error.message);
            console.error("Error fetching weather:", error);
        }
    }
    
    async fetchWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.currentUnit}`
            );
            
            const data = await response.json();
            const forecast = await this.fetchForecast(lat, lon);
            
            this.weatherData = { current: data, forecast };
            this.displayWeather(this.weatherData);
            
            // Change video based on weather condition
            this.adjustVideoForWeather(data.weather[0].main);
        } catch (error) {
            console.error("Error fetching weather by coordinates:", error);
        }
    }
    
    async fetchForecast(lat, lon) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.currentUnit}`
            );
            return await response.json();
        } catch (error) {
            console.error("Error fetching forecast:", error);
            return null;
        }
    }
    
    adjustVideoForWeather(weatherCondition) {
        const video = this.elements.videoBackground;
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour < 18;
        
        let videoUrl;
        
        switch (weatherCondition.toLowerCase()) {
            case "clear":
                videoUrl = isDaytime 
                    ? "https://assets.mixkit.co/videos/preview/mixkit-blue-sky-with-clouds-1257-large.mp4"
                    : "https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-stars-1337-large.mp4";
                break;
            case "clouds":
                videoUrl = isDaytime
                    ? "https://assets.mixkit.co/videos/preview/mixkit-cloudy-sky-with-sun-rays-1255-large.mp4"
                    : "https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-clouds-1338-large.mp4";
                break;
            case "rain":
                videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-window-1254-large.mp4";
                break;
            case "snow":
                videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-snow-falling-in-the-forest-1381-large.mp4";
                break;
            case "thunderstorm":
                videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-lightning-on-a-dark-night-1237-large.mp4";
                break;
            default:
                videoUrl = isDaytime
                    ? "https://assets.mixkit.co/videos/preview/mixkit-blue-sky-with-clouds-1257-large.mp4"
                    : "https://assets.mixkit.co/videos/preview/mixkit-night-sky-with-stars-1337-large.mp4";
        }
        
        // Only change if different from current video
        if (!video.src.includes(videoUrl.split('/').pop())) {
            video.src = videoUrl;
            video.load();
        }
    }
    
    displayWeather(data) {
        if (!data) return;
        
        const { current, forecast } = data;
        const unitSymbol = this.currentUnit === "metric" ? "°C" : "°F";
        const windUnit = this.currentUnit === "metric" ? "m/s" : "mph";
        
        // Update current weather
        this.elements.cityName.textContent = `${current.name}, ${current.sys.country}`;
        this.elements.todayDate.textContent = new Date(current.dt * 1000).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        this.elements.currentTime.textContent = new Date(current.dt * 1000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
        this.elements.currentTemp.textContent = `${Math.round(current.main.temp)}${unitSymbol}`;
        this.elements.weatherIcon.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
        this.elements.weatherIcon.alt = current.weather[0].description;
        this.elements.cloudType.textContent = this.capitalizeFirstLetter(current.weather[0].description);
        this.elements.feelsLike.textContent = `${Math.round(current.main.feels_like)}${unitSymbol}`;
        this.elements.humidity.textContent = `${current.main.humidity}%`;
        this.elements.windSpeed.textContent = `${current.wind.speed.toFixed(1)} ${windUnit}`;
        this.elements.pressure.textContent = `${current.main.pressure} hPa`;
        
        // Update forecast
        this.displayForecast(forecast);
    }
    
    displayForecast(forecastData) {
        if (!forecastData || !forecastData.list) return;
        
        this.elements.forecastContainer.innerHTML = "";
        const unitSymbol = this.currentUnit === "metric" ? "°C" : "°F";
        
        // Get daily forecast (every 24 hours)
        const dailyForecast = [];
        const days = new Set();
        
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString("en-US", { weekday: "short" });
            
            if (!days.has(day)) {
                days.add(day);
                dailyForecast.push(item);
            }
        });
        
        // Display next 5 days (skip today)
        dailyForecast.slice(1, 6).forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString("en-US", { weekday: "short" });
            
            const forecastCard = document.createElement("div");
            forecastCard.className = "forecast-card";
            
            forecastCard.innerHTML = `
                <div class="forecast-day">${day}</div>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <div class="forecast-temp">
                    <span class="forecast-high">${Math.round(item.main.temp_max)}${unitSymbol}</span>
                    <span class="forecast-low">${Math.round(item.main.temp_min)}${unitSymbol}</span>
                </div>
            `;
            
            this.elements.forecastContainer.appendChild(forecastCard);
        });
    }
    
    capitalizeFirstLetter(string) {
        return string.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    new WeatherApp();
});