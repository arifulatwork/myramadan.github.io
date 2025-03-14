// Automatically fetch location and prayer times when the page loads
window.onload = getUserLocation;

// Display today's date
const todayDate = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('todayDate').textContent = todayDate.toLocaleDateString('en-US', options);

let prayerTimes = {}; // Store fetched prayer times

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchLocationName(lat, lon);
        fetchPrayerTimes(lat, lon);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please allow location access.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

// Fetch city/country name using reverse geocoding
function fetchLocationName(lat, lon) {
  const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  fetch(geocodeUrl)
    .then(response => response.json())
    .then(data => {
      const location = `${data.city}, ${data.countryName}`;
      document.getElementById('userLocation').textContent = location;
    })
    .catch(error => {
      console.error('Error fetching location name:', error);
      document.getElementById('userLocation').textContent = 'Unknown Location';
    });
}

// Fetch prayer times
function fetchPrayerTimes(lat, lon) {
  const date = Math.floor(Date.now() / 1000);
  const apiUrl = `https://8ldbpgh8mh.execute-api.us-east-1.amazonaws.com/prod/location/${lat}/${lon}?date=${date}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Store prayer times
      prayerTimes = {
        sehri: data.fajr,
        iftar: data.sunset,
        sunrise: data.sunrise,
        dhuhr: data.dhuhr,
        asr: data.asr,
        maghrib: data.maghrib,
        isha: data.isha
      };

      // Update UI
      document.getElementById('sehri').textContent = data.fajr;
      document.getElementById('iftar').textContent = data.sunset;
      document.getElementById('sunrise').textContent = data.sunrise;
      document.getElementById('dhuhr').textContent = data.dhuhr;
      document.getElementById('asr').textContent = data.asr;
      document.getElementById('maghrib').textContent = data.maghrib;
      document.getElementById('isha').textContent = data.isha;

      // Start checking the time every minute
      checkPrayerTime();
      setInterval(checkPrayerTime, 60000); // Check every 60 seconds
    })
    .catch(error => {
      console.error('Error fetching prayer times:', error);
      alert('Failed to fetch prayer times. Please try again.');
    });
}

// Function to check the current time and play Azan
function checkPrayerTime() {
  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0].slice(0, 5); // Get HH:MM format

  for (let prayer in prayerTimes) {
    if (prayerTimes[prayer] === currentTime) {
      highlightPrayer(prayer); // Highlight the specific box
      if (prayer !== 'sunrise') { // Don't play Azan for Sunrise
        playAzan();
      }
      break;
    }
  }
}

// Function to play the Azan sound
function playAzan() {
  const azanAudio = document.getElementById('azanAudio');
  azanAudio.play().catch(error => console.error('Error playing audio:', error));
}

// Function to highlight the prayer time box
function highlightPrayer(prayer) {
  // Remove previous highlights
  document.querySelectorAll('.time-card').forEach(card => {
    card.classList.remove('glow', 'sehri-glow');
  });

  // Get the specific prayer card
  const prayerCard = document.getElementById(prayer).parentElement;

  if (prayer === 'sehri') {
    prayerCard.classList.add('sehri-glow'); // Special glow for Sehri
  } else {
    prayerCard.classList.add('glow'); // Normal glow for other prayers
  }
}
