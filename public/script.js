document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".chat-input-area");
  const input = document.getElementById("userInput");
  const chat = document.getElementById("chatMessages");
  const submitBtn = form.querySelector("button");

  form.addEventListener("submit", sendMessage);

  function sendMessage(event) {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage("user", message);
    input.value = "";
    input.disabled = true;
    submitBtn.disabled = true;

    const typingIndicator = appendMessage("bot", "Typing...");

    fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    })
      .then((response) => response.json())
      .then((data) => {
        const reply = data.reply || "Sorry, no response from AI.";
        typingIndicator.innerHTML = formatMessage(reply);
      })
      .catch((error) => {
        console.error("API error:", error);
        typingIndicator.innerHTML = formatMessage("Error: Could not get a response.");
      })
      .finally(() => {
        input.disabled = false;
        submitBtn.disabled = false;
        input.focus();
      });
  }

  function appendMessage(sender, text) {
    const msgWrapper = document.createElement("div");
    msgWrapper.className = "d-flex mb-3";
    msgWrapper.style.justifyContent = sender === "user" ? "flex-end" : "flex-start";

    const msg = document.createElement("div");
    msg.className = `p-2 rounded-3 shadow-sm ${
      sender === "user" ? "bg-success text-white" : "bg-light text-dark"
    }`;
    msg.style.maxWidth = "75%";
    msg.innerHTML = `
      <div style="white-space: pre-wrap;">${text}</div>
      <div class="timestamp text-end mt-1 small text-muted">
        ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    `;

    msgWrapper.appendChild(msg);
    chat.appendChild(msgWrapper);
    chat.scrollTop = chat.scrollHeight;
    return msg;
  }

  function formatMessage(text) {
    return `
      <div style="white-space: pre-wrap;">${text}</div>
      <div class="timestamp text-end mt-1 small text-muted">
        ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    `;
  }
});

function goBack() {
  window.history.back();
}


const apiKey = "20bb310e06fd4971a337373965b59bcf"; // Replace this

  let map;
  let userMarker;

  // Default location: Kano, Nigeria
  const defaultLat = 12.0022;
  const defaultLng = 8.5919;
  function initMap(lat = defaultLat, lng = defaultLng) {
    if (!map) {
        map = L.map('map').setView([lat, lng], 13);
        L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`, {  // ✅ Backticks used
            attribution: '&copy; OpenStreetMap contributors | Geoapify',
            maxZoom: 20,
        }).addTo(map);
    } else {
        map.setView([lat, lng], 13);
    }
}


  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          initMap(lat, lng);

          if (userMarker) {
            map.removeLayer(userMarker);
          }

          userMarker = L.marker([lat, lng]).addTo(map).bindPopup("You are here").openPopup();

          findHospitals(lat, lng);
        },
        error => {
          alert("Could not get your location. Showing default (Kano).");
          findHospitals(defaultLat, defaultLng);
        }
      );
    } else {
      alert("Geolocation not supported. Showing default (Kano).");
      findHospitals(defaultLat, defaultLng);
    }
  }

  function findHospitals(lat, lng) {
    const radius = 5000;
    const url = `https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=20&apiKey=${apiKey}`; // ✅ Corrected URL format

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.features.length) {
          alert("No hospitals found nearby.");
          return;
        }

        data.features.forEach(hospital => {
          const coords = hospital.geometry.coordinates;
          const name = hospital.properties.name || "Unnamed Hospital";

          L.marker([coords[1], coords[0]])
            .addTo(map)
            .bindPopup(`<strong>${name}</strong>`);  // ✅ Corrected HTML string format
        });
      })
      .catch(err => console.error("Error fetching hospitals:", err));
}


  // Load default map on Kano
  initMap();
  // Optionally auto-search hospitals in Kano when the page loads
  findHospitals(defaultLat, defaultLng);
