"use strict";

(function() {

  const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?";

  window.addEventListener("load", init);

  function init() {
    getCurrentLocation();
    qs("form").addEventListener("submit", (event) => {
      event.preventDefault();
      getWeather();
    });
  }

  function getWeather() {
    let url = BASE_URL + "q=" + id("search-box").value;
    url = url + "&appid=889a527d356dd5de41191d294946320e&units=imperial";
    id("search-box").value = "";
    fetch(url)
    .then(statusCheck)
    .then(res => res.json())
    .then(addWeather)
    .catch(handleError);
  }

  function addWeather(res) {
    console.log(res);
    let card = gen("section");
    addMetadata(card, res);
    addMainWeather(card, res);
    addMoreWeather(card, res);
    changeCardColor(card, res);
    card.classList.add("card");
    id("weather-section").appendChild(card);
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
    time.textContent = "Updated @ " + date.toLocaleTimeString();
    card.appendChild(time);
  }

  function addMainWeather(card, res) {
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
    card.appendChild(weather);

    let minMax = gen("p");
    minMax.textContent = Math.round(res.main.temp_max) + "/" + Math.round(res.main.temp_min) + "° F";
    card.appendChild(minMax);

    let description = gen("h3");
    description.textContent = res.weather[0].description;
    card.appendChild(description);
  }

  function addMoreWeather(card, res) {
    let humidity = gen("p");
    humidity.textContent = "Humidity: " + res.main.humidity + "%";
    card.appendChild(humidity);

    let feelsLike = gen("p");
    feelsLike.textContent = "Feels Like: " + res.main.feels_like + "° F";
    card.appendChild(feelsLike);

    let wind = gen("p");
    wind.textContent = "Wind Speed: " + res.wind.speed + "mph";
    card.appendChild(wind);
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
      navigator.geolocation.getCurrentPosition(getLocationWeather, handleError);
    }
  }

  function getLocationWeather(location) {
    let url = BASE_URL + "lat=" + location.coords.latitude;
    url = url + "&lon=" + location.coords.longitude;
    url = url + "&appid=889a527d356dd5de41191d294946320e&units=imperial";
    fetch(url)
    .then(statusCheck)
    .then(res => res.json())
    .then(addWeather)
    .catch(handleError);
  }

  function deleteCard() {
    this.parentElement.parentElement.remove();
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

  function handleError(error) {
    console.log(error);
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