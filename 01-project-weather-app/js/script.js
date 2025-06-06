const apiKey = "your api is here";  //you can use openweathermap api (current weather apı)
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q="; // Enter your full url like this

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city){
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (response.status == 404){
        document.querySelector(".error").style.display = "flex";
        document.querySelector(".weather").style.display = "none";
    }else {
        var data = await response.json();

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + "km/h";
    
        if (data.weather[0].main == "Clouds"){
            weatherIcon.src = "assets/images/cloudy.png";
        } else if (data.weather[0].main == "Clear"){
            weatherIcon.src = "assets/images/clear.png";
        }
         else if (data.weather[0].main == "Rain"){
            weatherIcon.src = "assets/images/snow.png";
        }
          else if (data.weather[0].main == "Drizzle"){
            weatherIcon.src = "assets/images/weather.png";
        }
         else if (data.weather[0].main == "Mist"){
            weatherIcon.src = "assets/images/haze.png";
        }
        document.querySelector(".weather").style.display = "block";
         document.querySelector(".error").style.display = "none";
    }
    }
searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    if (city === "") return;

    checkWeather(city);
    searchBox.value = ""; 

});

document.addEventListener("DOMContentLoaded", () => {
    checkWeather("new york");
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector("button").click();
    }
  });
