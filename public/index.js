/**
 * Name: Lauren Wong
 * Date: July, 2020
 * Description: This is the index.js file for the Weatherly website which is a
 * weather website created using the OpenWeatherMap API and icons from Those
 * Icons on Flaticon. On Weatherly, users can search for a city through the city
 * name or zip code to add that location to the main page, and check the current
 * 7-day forecast.
 */

"use strict";

(function() {

  const BASE_URL = "https://api.openweathermap.org/data/2.5/";
  const GEOLOCATION_URL = "https://api.openweathermap.org/geo/1.0/";
  const API_KEY = "5cfa7d88b68a8c44ab857b0260dc2256";

  window.addEventListener("load", init);

  /**
   * Sets up the page by adding the information cards for the user's current
   * location as well as any of the other cities they have searched for
   * previously. Also adds an event listener the search box and search button to
   * get weather data on the location or zip code that the user typed into the
   * search box.
   */
  function init() {
    getCurrentLocation();
    addOldCards();
    qs("form").addEventListener("submit", (event) => {
      event.preventDefault();
      getLocation();
    });
    qs("form .btn").addEventListener("click", getLocation);
  }

  /**
   * Gets all location information on the city or zip code the user has typed
   * into the search box.
   */
  function getLocation() {
    let location = id("search-box").value;
    if (!parseInt(location)) {
      let url = GEOLOCATION_URL + "direct?q=" + location;
      url = url + "&limit=1&appid=" + API_KEY;
      fetch(url)
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => getCoordinates(res[0]))
      .catch(handleError);
    } else {
      let url = GEOLOCATION_URL + "zip?zip=" + parseInt(location);
      url = url + "&appid=" + API_KEY;
      fetch(url)
      .then(statusCheck)
      .then(res => res.json())
      .then(getCoordinates)
      .catch(handleError);
    }
  }

  /**
   * Gets the latitude and longitude coordinates from the given location
   * response.
   * @param {string} location - json containing the geographic location information for a city
   */
  function getCoordinates(location) {
    let latitude = "";
    let longitude = "";
    let isCurrentLocation = false;
    if (location.coords) {
      isCurrentLocation = true;
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
    } else {
      latitude = location.lat;
      longitude = location.lon;
    }
    getWeather(latitude, longitude, isCurrentLocation);
  }

  /**
   * Gets the weather data on a city using the given latitude and longitude.
   * @param {string} latitude - the latitude of the city
   * @param {string} longitude - the longitude of the city
   * @param {boolean} isCurrentLocation - whether the given coordinates represent the user's current location
   */
  function getWeather(latitude, longitude, isCurrentLocation) {
    let url = BASE_URL + "weather?lat=" + latitude;
    url = url + "&lon=" + longitude;
    url = url + "&appid=" + API_KEY + "&units=imperial";
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

  /**
   * Adds all weather information to an information card. This information
   * includes location, time updated, current weather, and the weather forecast
   * for the next 8 days.
   * @param {string} res - json containing the weather information for a city
   * @param {boolean} isCurrentLocation - whether the response represents the user's current location
   */
  function addWeather(res, isCurrentLocation) {
      let card = gen("section");
      addHeader(card, res);
      addCurrentWeather(card, res);
      addDayDetails(card, res);
      changeCardColor(card, res);
      card.classList.add("card");
      if (isCurrentLocation) {
        id("weather-section").prepend(card);
      } else {
        id("weather-section").appendChild(card);
      }
      getForecast(card, res);
    }

  /**
   * Adds the key information and functions to the header of the card. This
   * information includes the name of the city and country, the delete button,
   * and the time the information was last updated.
   * @param {DOMObject} card - section element representing a single weather card for a city
   * @param {string} res - json containing weather data on a city
   */
  function addHeader(card, res) {
    let header = gen("section");
    let title = gen("h2");
    title.textContent = res.name + ", " + res.sys.country;
    header.appendChild(title);
    let deleteBtn = gen("img");
    deleteBtn.src = "img/delete.png";
    deleteBtn.classList.add("btn");
    deleteBtn.addEventListener("click", deleteCard);
    header.appendChild(deleteBtn);
    header.classList.add("card-header");
    card.appendChild(header);
    let time = gen("p");
    let date = new Date();
    time.textContent = "Updated @ " + date.toLocaleTimeString() + " on " + date.toLocaleDateString();
    card.appendChild(time);
  }

  /**
   * Adds the current weather information to the card. This information includes
   * an icon representing the current weather conditions, the current
   * temperature, the minimum and maximum temperatures for the day, and a short
   * description of the weather.
   * @param {DOMObject} card - section element representing a single weather card for a city
   * @param {string} res - json containing weather data on a city
   */
  function addCurrentWeather(card, res) {
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

  /**
   * Adds the extra details for today's weather to the card. These details
   * include the humidity levels the temperature it actually feels like, the
   * current wind speed, the visibility, and the atmospheric pressure.
   * @param {DOMObject} card - section element representing a single weather card for a city
   * @param {string} res - json containing weather data on a city
   */
  function addDayDetails(card, res) {
    let title = gen("h2");
    title.textContent = "Day Details"
    card.appendChild(title);
    let divider = gen("hr");
    card.appendChild(divider);
    let list = gen("ul");
    addListItem(list, "Humidity: " + res.main.humidity + "%");
    addListItem(list, "Feels Like: " + Math.round(res.main.feels_like) + "° F");
    addListItem(list, "Wind Speed: " + res.wind.speed + "mph");
    addListItem(list, "Visibility: " + (res.visibility / 1000) + " km");
    addListItem(list, "Pressure: " + res.main.pressure + " hPa")
    card.appendChild(list);
  }

  /**
   * Gets the daily forecast weather data for the upcoming 7 days and the
   * current day. It uses the latitude and longitude from the response data to
   * get the forecast.
   * @param {DOMObject} card - section element representing a single weather card for a city
   * @param {string} res - json containing weather and location data on a city
   */
  function getForecast(card, res) {
    let url = BASE_URL + "onecall?lat=" + res.coord.lat;
    url = url + "&lon=" + res.coord.lon + "&exclude=minutely,hourly"
    url = url + "&appid=" + API_KEY + "&units=imperial";
    id("search-box").value = "";
    fetch(url)
    .then(statusCheck)
    .then(res => res.json())
    .then((res) => addForecasts(res, card))
    .catch(handleError);
  }

  /**
   * Adds a basic 7-day weather forecast information section and the header to
   * the card.
   * @param {string} res - json containing the 7-day weather forecast data
   * @param {DOMObject} card - section element representing a single weather card for a city
   */
  function addForecasts(res, card) {
    let sevenDayForecast = gen("section");
    let title = gen("h2");
    title.textContent = "8-day Forecast"
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

  /**
   * Adds the weather forecast for each of the 7 upcoming days. This information
   * includes the date, an icon representing the weather conditions, minimum and
   * maximum temperatures, and a short description of the weather conditions.
   * @param {string} res - json containing the weather forecast for one day
   * @param {DOMObject} forecasts - section element containing the cards for the 7 day forecast
   * @param {number} offset - UTC timezone offset in seconds
   * @param {DOMObject} dayWeather - section element containing the day details for forecast day
   */
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

  /**
   * Displays the weather forecast and temperatures for a single day and selects
   * the day on the page.
   * @param {string} res - json containing the weather forecast for one day
   * @param {DOMObject} forecasts - section element containing the cards for the 7 day forecast
   * @param {DOMObject} day - section element representing one card in the forecasts section
   * @param {DOMObject} dayWeather - section element containing the day details for forecast day
   */
  function showWeather(res, forecasts, day, dayWeather) {
    forecasts = forecasts.children;
    for (let i = 0; i < forecasts.length; i++) {
      forecasts[i].classList.remove("selected");
    }
    day.classList.add("selected");
    addDayWeather(dayWeather, res);
    addDayTemps(dayWeather, res);
  }

  /**
   * Adds the day details section to the bottom of the weather card. The
   * information in this section includes the humidity, wind speed, UV index,
   * and atmospheric pressure.
   * @param {DOMObject} dayWeather - section element containing the day details for forecast day
   * @param {string} res - json containing the weather forecast for one day
   */
  function addDayWeather(dayWeather, res) {
    dayWeather.innerHTML = "";
    let section = gen("section");
    let title = gen("h3");
    title.textContent = "Day Details";
    section.appendChild(title);
    let divider = gen("hr");
    section.appendChild(divider);
    let list = gen("ul");
    addListItem(list, "Humidity: " + res.humidity + "%");
    addListItem(list, "Wind Speed: " + res.wind_speed + "mph");
    addListItem(list, "UV Index: " + Math.round(res.uvi));
    addListItem(list, "Pressure: " + res.pressure + " hPa");
    section.appendChild(list);
    dayWeather.appendChild(section);
  }

  /**
   * Adds a list item to the given list.
   * @param {DOMObject} list - unordered list element to put the new list item in
   * @param {string} text - information for the list item
   */
  function addListItem(list, text) {
    let item = gen("li");
    item.textContent = text;
    list.appendChild(item);
  }

  /**
   * Adds the table of the actual temperatures and real feel temperatures for
   * the morning, afternoon, evening, and night to the bottom of the card.
   * @param {DOMObject} dayWeather - section element containing the day details for forecast day
   * @param {string} res - json containing the weather forecast for one day
   */
  function addDayTemps(dayWeather, res) {
    let table = gen("table");
    let headers = ["", "Morning", "Afternoon", "Evening", "Night"];
    let headerRow = gen("tr");
    for (let i = 0; i < headers.length; i++) {
      let header = gen("th");
      header.textContent = headers[i];
      headerRow.appendChild(header);
    }
    table.appendChild(headerRow);
    let data = ["Temperature", Math.round(res.temp.morn) + "° F", Math.round(res.temp.day) + "° F",
                Math.round(res.temp.eve) + "° F", Math.round(res.temp.night) + "° F"];
    addRow(table, data);
    data = ["Feels Like", Math.round(res.feels_like.morn) + "° F", Math.round(res.feels_like.day) + "° F",
            Math.round(res.feels_like.eve) + "° F", Math.round(res.feels_like.night) + "° F"];
    addRow(table, data);
    dayWeather.appendChild(table);
  }

  /**
   * Adds a single row to the given table using all the given data.
   * @param {DOMObject} table - table element containing the temperature information for one day
   * @param {array} data - list of data to input for one row in the table
   */
  function addRow(table, data) {
    let row = gen("tr");
    for (let i = 0; i < data.length; i++) {
      let cell = gen("td");
      cell.textContent = data[i];
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  /**
   * Changes the color of a weather card for a city depending on whether it is
   * day or night in city it represents.
   * @param {DOMObject} card - section element representing a city's weather card
   * @param {string} res - json containing the weather information for a city
   */
  function changeCardColor(card, res) {
    let length = res.weather[0].icon.length;
    let time = res.weather[0].icon.substring(length - 1);
    if (time === "d") {
      card.classList.add("day");
    } else {
      card.classList.add("night");
    }
  }

  /**
   * If geolocation is supported, it get's the user's current location and uses
   * the data to add the weather card for their city to the top of the page. If
   * geolocation is not supported, it clears the page and adds a message saying
   * that the user's browser does not support geolocation.
   */
  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getCoordinates, handleError);
    } else {
      id("weather-section").innerHTML = "";
      let response = gen("p");
      response.textContent = "Sorry, but this browser does not support geolocation.";
      qs("main").appendChild(response);
    }
  }

  /**
   * If the user has visited the site previously and has added other weather
   * cards to the page, it will add those cards to the page when it loads.
   */
  function addOldCards() {
    for (let i = 0; i < window.localStorage.length; i++) {
      let keyName = window.localStorage.key(i);
      let jsonData = JSON.parse(window.localStorage.getItem(keyName));
      addWeather(jsonData);
    }
  }

  /**
   * Deletes the selected card and removes it from memory so that if the user
   * revisits the page, it will not show up and they will have to add it back
   * manually.
   */
  function deleteCard() {
    this.parentElement.parentElement.remove();
    let location = this.previousElementSibling.textContent;
    location = location.substring(0, location.indexOf(","));
    window.localStorage.removeItem(location);
  }

  /**
   * Checks whether a fetch's response was successful and valid. If successful,
   * it returns the response. Otherwise, it returns the rejected promise with an
   * error and the response in text format.
   * @param {object} res - response to check if valid or not
   * @return {object} - valid response if successful, otherwise a rejected Promise
   */
   async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Handles an error by clearing the page apart from the header and the footer,
   * displaying an error message, disabling the search-box, and removing the
   * event listener from the search button.
   */
  function handleError() {
    id("search-box").disabled = true;
    qs("form .btn").removeEventListener("click", getLocation);
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
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new element
   * @returns {object} - new DOM object with the given HTML tag
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();