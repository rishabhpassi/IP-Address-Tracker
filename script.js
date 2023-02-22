// Define the API key for IP geolocation
const apiKey = 'at_WtR2tRufSpIpbZSCsNu04wx4HSFTf';

// Get elements that will display geolocation data
const ipElement = document.getElementsByClassName('ip-address')[0];
const locationElement = document.getElementsByClassName('location')[0];
const timezoneElement = document.getElementsByClassName('time-zone')[0];
const ispElement = document.getElementsByClassName('isp')[0];

// Get the submit button and search bar
const submit = document.getElementsByClassName('submit')[0];
const searchBar = document.getElementsByClassName('search-bar')[0];

// Define the initial API URL without user input
const defaultUrl = `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKey}`;

// Initialize the Leaflet map with default coordinates
let map = L.map('map').setView([51.505, -0.09], 13);
let marker;

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
// Ask for permission to get user's IP on page load
window.addEventListener('load', () => {
    const permissionPrompt = confirm('Allow this site to access your IP address for geolocation?');
    if (permissionPrompt) {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const userIp = data.ip;
                searchBar.value = userIp;
                fetchData(defaultUrl + `&ipAddress=${userIp}`);
            })
            .catch(error => console.error(error));
    }
});

// Attach a click event listener to the submit button to fetch geolocation data from the API
submit.addEventListener('click', (event) => {
    event.preventDefault();
    const userInput = searchBar.value.trim();
    if (userInput) {
        const url = `https://geo.ipify.org/api/v2/country,city,vpn?apiKey=${apiKey}&ipAddress=${userInput}`;
        fetchData(url);
    } else {
        searchBar.placeholder = "Please enter a valid IP address or domain name";
    }
});

// Function to fetch geolocation data from the API
function fetchData(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Extract relevant data from the API response
            const ip = data.ip;
            const location = `${data.location.city}, ${data.location.region} ${data.location.postalCode}`;

            const timezone = `${data.location.timezone}`;
            

            const isp = data.isp;

            // Update the display elements with the geolocation data
            ipElement.innerHTML = ip;
            locationElement.innerHTML = location;
            timezoneElement.innerHTML = timezone;
            ispElement.innerHTML = isp;

            // Get the latitude and longitude from the API response
            const lat = data.location.lat;
            const lng = data.location.lng;

            // Create a new L.icon object with the image URL and size
            const myIcon = L.icon({
                iconUrl: './images/icon-location.svg',
                iconSize: [32, 32],
                className: 'icon-location'
            });

            // Update the Leaflet map with the new coordinates and custom marker
            map.setView([lat, lng], 13);
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker([lat, lng], { icon: myIcon, iconAngle: 45 }).addTo(map);


            // Add a tile layer to the map using OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add a popup to the map with the location name
            const popup = L.popup()
                .setLatLng([lat, lng])
                .setContent(`Your location: ${data.location.city}`)
                .openOn(map);
        })
        .catch(error => {
            console.error(error);
            searchBar.placeholder = "Oops! Something went wrong. Please try again.";
        });
}
