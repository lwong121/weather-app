"use strict";

(function() {

  const BASE_URL = "https://api.openweathermap.org/data/2.5/";

  window.addEventListener("load", init);

  function init() {
    getCurrentLocation();
    addOldCards();
    qs("form").addEventListener("submit", (event) => {
      event.preventDefault();
      getLocation();
    });
  }

  function getLocation() {
    let url = "http://api.openweathermap.org/geo/1.0/direct?q=" + id("search-box").value;
    url = url + "&limit=1&appid=889a527d356dd5de41191d294946320e";
    fetch(url)
    .then(statusCheck)
    .then(res => res.json())
    .then(getWeather)
    .catch(handleError);
  }

  function addWeather(res, isCurrentLocation) {
      let card = gen("section");
      addMetadata(card, res);
      addMainWeather(card, res);
      addMoreWeather(card, res);
      changeCardColor(card, res);
      card.classList.add("card");
      if (isCurrentLocation) {
        id("weather-section").prepend(card);
      } else {
        id("weather-section").appendChild(card);
      }
      getForecast(card, res);
    }

  function addMetadata(card, res) {
    let header = gen("section");
    let title = gen("h2");
    title.textContent = res.name + ", " + res.sys.country;
    header.appendChild(title);

    let deleteBtn = gen("img");
    deleteBtn.src = "img/delete.png";
    deleteBtn.classList.add("delete");
    deleteBtn.addEventListener("click", deleteCard);
    header.appendChild(deleteBtn);

    header.classList.add("card-header");
    card.appendChild(header);

    let time = gen("p");
    let date = new Date();
    time.textContent = "Updated @ " + date.toLocaleTimeString() + " on " + date.toLocaleDateString();
    card.appendChild(time);
  }

  function addMainWeather(card, res) {
    let currentWeather = gen("section");

    let weather = gen("section");
    let icon = gen("img");
    icon.src = "img/" + res.weather[0].icon + ".png";
    icon.alt = res.weather[0].description;
    icon.classList.add("icon");
    weather.appendChild(icon);
    let temperature = gen("h1");
    temperature.textContent = Math.round(res.main.temp) + "° F";
    weather.appendChild(temperature);
    weather.classList.add("weather");
    currentWeather.appendChild(weather);

    let minMax = gen("p");
    minMax.textContent = Math.round(res.main.temp_max) + " / " + Math.round(res.main.temp_min) + "° F";
    currentWeather.appendChild(minMax);

    let description = gen("h3");
    description.textContent = res.weather[0].description;
    currentWeather.appendChild(description);

    currentWeather.classList.add("current-weather");
    card.appendChild(currentWeather);
  }

  function addMoreWeather(card, res) {
    let title = gen("h2");
    title.textContent = "Day Details"
    card.appendChild(title);

    let divider = gen("hr");
    card.appendChild(divider);

    let list = gen("ul");
    let humidity = gen("li");
    humidity.textContent = "Humidity: " + res.main.humidity + "%";
    list.appendChild(humidity);

    let feelsLike = gen("li");
    feelsLike.textContent = "Feels Like: " + res.main.feels_like + "° F";
    list.appendChild(feelsLike);

    let wind = gen("li");
    wind.textContent = "Wind Speed: " + res.wind.speed + "mph";
    list.appendChild(wind);

    let visibility = gen("li");
    visibility.textContent = "Visibility: " + (res.visibility / 1000) + " km";
    list.appendChild(visibility);

    let pressure = gen("li");
    pressure.textContent = "Pressure: " + res.main.pressure + " hPa";
    list.appendChild(pressure);

    card.appendChild(list);
  }

  function getForecast(card, res) {
    let url = BASE_URL + "onecall?lat=" + res.coord.lat;
    url = url + "&lon=" + res.coord.lon + "&exclude=minutely,hourly"
    url = url + "&appid=889a527d356dd5de41191d294946320e&units=imperial";
    id("search-box").value = "";
    fetch(url)
    .then(statusCheck)
    .then(res => res.json())
    .then((res) => addForecasts(res, card))
    .catch(handleError);
  }

  function addForecasts(res, card) {
    let sevenDayForecast = gen("section");
    let title = gen("h2");
    title.textContent = "7-day Forecast"
    card.appendChild(title);

    let divider = gen("hr");
    card.appendChild(divider);

    let forecasts = gen("section");
    let dayWeather = gen("section");
    for (let i = 0; i < res.daily.length; i++) {
      addDailyForecast(res.daily[i], forecasts, res.timezone_offset, dayWeather);
    }
    forecasts.classList.add("forecasts");
    sevenDayForecast.appendChild(forecasts);
    card.appendChild(sevenDayForecast);

    card.appendChild(dayWeather);
  }

  function addDailyForecast(res, forecasts, offset, dayWeather) {
    let dayForecast = gen("section");

    let time = gen("p");
    let date = new Date((res.dt * 1000) + (offset * 1000));
    let options = { weekday: 'short', month: 'short', day: 'numeric' };
    time.textContent = date.toLocaleDateString("en-US", options);
    dayForecast.appendChild(time);

    let icon = gen("img");
    icon.src = "img/" + res.weather[0].icon + ".png";
    icon.atl = res.weather[0].description;
    icon.classList.add("icon");
    dayForecast.appendChild(icon);

    let temp = gen("p");
    temp.textContent = Math.round(res.temp.min) + " / " + Math.round(res.temp.max) + "° F";
    dayForecast.appendChild(temp);

    let description = gen("p");
    description.textContent = res.weather[0].description;
    dayForecast.appendChild(description);

    dayForecast.addEventListener("click", () => showWeather(res, forecasts, dayForecast, dayWeather));

    dayForecast.classList.add("forecast");
    forecasts.appendChild(dayForecast);
  }

  function showWeather(res, forecasts, day, dayWeather) {
    forecasts = forecasts.children;
    for (let i = 0; i < forecasts.length; i++) {
      forecasts[i].classList.remove("selected");
    }
    day.classList.add("selected");
    addDayWeather(dayWeather, res);
  }

  function addDayWeather(dayWeather, res) {
    dayWeather.innerHTML = "";
    let section = gen("section");
    let title = gen("h3");
    title.textContent = "Day Details";
    section.appendChild(title);

    let divider = gen("hr");
    section.appendChild(divider);

    let list = gen("ul");
    let humidity = gen("li");
    humidity.textContent = "Humidity: " + res.humidity + "%";
    list.appendChild(humidity);
    let wind = gen("li");
    wind.textContent = "Wind Speed: " + res.wind_speed + "mph";
    list.appendChild(wind);
    let visibility = gen("li");
    visibility.textContent = "UV Index: " + res.uvi;
    list.appendChild(visibility);
    let pressure = gen("li");
    pressure.textContent = "Pressure: " + res.pressure + " hPa";
    list.appendChild(pressure);
    section.appendChild(list);

    dayWeather.appendChild(section);
  }

  function changeCardColor(card, res) {
    let length = res.weather[0].icon.length;
    let time = res.weather[0].icon.substring(length - 1);
    if (time === "d") {
      card.classList.add("day");
    } else {
      card.classList.add("night");
    }
  }

  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getWeather, handleError);
    }
  }

  function getWeather(location) {
    let latitude = "";
    let longitude = "";
    let isCurrentLocation = false;
    if (location.coords) {
      isCurrentLocation = true;
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
    } else {
      latitude = location[0].lat;
      longitude = location[0].lon;
    }
    let url = BASE_URL + "weather?lat=" + latitude;
    url = url + "&lon=" + longitude;
    url = url + "&appid=889a527d356dd5de41191d294946320e&units=imperial";
    fetch(url)
    .then(statusCheck)
    .then(res => res.json())
    .then((res) => {
      if (!isCurrentLocation) {
        window.localStorage.setItem(res.name, JSON.stringify(res));
      }
      addWeather(res, isCurrentLocation);
    })
    .catch(handleError);
  }

  function addOldCards() {
    for (let i = 0; i < window.localStorage.length; i++) {
      let keyName = window.localStorage.key(i);
      let jsonData = JSON.parse(window.localStorage.getItem(keyName));
      addWeather(jsonData);
    }
  }

  function deleteCard() {
    this.parentElement.parentElement.remove();
    let location = this.previousElementSibling.textContent;
    location = location.substring(0, location.indexOf(","));
    window.localStorage.removeItem(location);
  }

  /**
   * Checks whether a fetch's response was successful and valid. If successful, it
   * returns the response. Otherwise, it returns the rejected promise with an error
   * and the response in text format.
   * @param {object} res - response to check if valid or not
   * @return {object} - valid response if successful, otherwise a rejected Promise
   */
   async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  function handleError() {
    id("weather-section").innerHTML = "";
    let error = gen("section");
    error.textContent = "Sorry, something went wrong. Reload?";
    error.id = "error";
    qs("main").appendChild(error);
  }

  /**
   * Returns the element with the given idName.
   * @param {string} idName - element ID name
   * @returns {object} - DOM object with the given id name
   */
   function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element with the given CSS selector.
   * @param {string} selector - CSS query selector name
   * @returns {object} - first DOM object that matchest the selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of elements with the given CSS selector.
   * @param {string} selector - CSS query selector name
   * @returns {object[]} - array of DOM objects that match the selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new element
   * @returns {object} - new DOM object with the given HTML tag
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();