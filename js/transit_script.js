/* 
   =========================================================
   Weather App JS File: File: transit_script.js
   ---------------------------------------------------------
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================
   Content: The main JavaScript file of the App.
   =========================================================
   Developer: Mohsen Ghazel
   Version: 31-Mar-2026
   =========================================================
*/

/*
  * - Boston MBTA Live Bus Tracker Features:
  *
  *    - Live bus locations (MBTA vehicles API)
  *    - Route filter + direction filter
  *    - Custom colored bus icons with direction arrows
  *    - Smooth animated bus movement
  *    - Sidebar with live bus list (click to zoom)
  *    - Bus stops + arrival predictions for selected route
 */

// ===============================
// SECTION 1: Global State & Setup
// ===============================
// Map instance
const map = L.map("map").setView([42.3601, -71.0589], 12);

// Base map tiles (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

// State: markers and filters
let busMarkers = {};      // vehicleId -> Leaflet marker
let stopMarkers = [];     // array of Leaflet markers for stops
let currentRouteFilter = "";
let lastVehiclePositions = {}; // vehicleId -> { lat, lon }

// DOM elements
const routeInput = document.getElementById("routeInput");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const directionFilter = document.getElementById("directionFilter");
const statusText = document.getElementById("statusText");
const busList = document.getElementById("busList");

// Refresh interval (ms)
const REFRESH_INTERVAL = 10000;

// ===============================
// SECTION 2: Utility Functions
// ===============================

/**
 * Generate a consistent color for a given route label.
 */
function routeColor(route) {
  const colors = [
    "#e6194b", "#3cb44b", "#ffe119", "#4363d8",
    "#f58231", "#911eb4", "#46f0f0", "#f032e6",
    "#bcf60c", "#fabebe", "#008080", "#e6beff"
  ];
  let index = 0;
  const key = route || "default";
  for (let i = 0; i < key.length; i++) {
    index = (index + key.charCodeAt(i)) % colors.length;
  }
  return colors[index];
}

/**
 * Create a custom bus icon with:
 * - Colored label (route)
 * - Direction arrow (bearing)
 */
function createBusIcon(route, bearing) {
  const color = routeColor(route);
  const safeBearing = typeof bearing === "number" ? bearing : 0;

  return L.divIcon({
    className: "bus-icon",
    html: `
      <div class="bus-marker">
        <div class="bus-arrow"
             style="border-bottom-color:${color};
                    transform: rotate(${safeBearing}deg);">
        </div>
        <div class="bus-label" style="background:${color}">
          ${route || "?"}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

/**
 * Smoothly animate a marker from its old position to a new one.
 * durationMs: total animation time in milliseconds.
 */
function animateMarker(marker, fromLatLng, toLatLng, durationMs = 500) {
  const startTime = performance.now();

  function step(now) {
    const t = Math.min(1, (now - startTime) / durationMs);
    const lat = fromLatLng.lat + (toLatLng.lat - fromLatLng.lat) * t;
    const lng = fromLatLng.lng + (toLatLng.lng - fromLatLng.lng) * t;
    marker.setLatLng([lat, lng]);
    if (t < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/**
 * Clear all stop markers from the map.
 */
function clearStopMarkers() {
  stopMarkers.forEach((m) => map.removeLayer(m));
  stopMarkers = [];
}

// ===============================
// SECTION 3: Fetching MBTA Data
// ===============================

/**
 * Fetch live vehicle locations from MBTA.
 * Applies route and direction filters.
 */
async function fetchBusLocations() {
  try {
    statusText.textContent = "Loading bus data...";

    let url = "https://api-v3.mbta.com/vehicles?filter[route_type]=3"; // 3 = bus

    if (currentRouteFilter) {
      url += `&filter[route]=${encodeURIComponent(currentRouteFilter)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      statusText.textContent = `Error: ${response.status}`;
      console.error("Failed to fetch MBTA data:", response.status);
      return;
    }

    const data = await response.json();
    const vehicles = data.data || [];

    updateMapWithVehicles(vehicles);
    updateSidebar(vehicles);

    statusText.textContent = `Showing ${vehicles.length} vehicle(s)${
      currentRouteFilter ? ` on route ${currentRouteFilter}` : ""
    }`;

    // Also fetch stops + predictions if a specific route is selected
    if (currentRouteFilter) {
      fetchStopsAndPredictions(currentRouteFilter);
    } else {
      clearStopMarkers();
    }
  } catch (error) {
    console.error("Error fetching MBTA vehicles:", error);
    statusText.textContent = "Error loading data. Check console.";
  }
}

/**
 * Fetch stops and arrival predictions for a given route.
 */
async function fetchStopsAndPredictions(route) {
  try {
    clearStopMarkers();

    const stopsUrl = `https://api-v3.mbta.com/stops?filter[route]=${encodeURIComponent(route)}&filter[route_type]=3`;

    const predictionsUrl = `https://api-v3.mbta.com/predictions?filter[route]=${encodeURIComponent(route)}&filter[route_type]=3`;

    const [stopsRes, predsRes] = await Promise.all([
      fetch(stopsUrl),
      fetch(predictionsUrl)
    ]);

    if (!stopsRes.ok || !predsRes.ok) {
      console.error("Failed to fetch stops or predictions");
      return;
    }

    const stopsData = await stopsRes.json();
    const predsData = await predsRes.json();

    const stops = stopsData.data || [];
    const predictions = predsData.data || [];

    // Build map: stopId -> array of arrival times
    const predictionsByStop = {};
    predictions.forEach((p) => {
      const attrs = p.attributes;
      const stopId = attrs.stop_id;
      if (!stopId) return;

      const time =
        attrs.arrival_time || attrs.departure_time || attrs.schedule_relationship;
      if (!time) return;

      if (!predictionsByStop[stopId]) {
        predictionsByStop[stopId] = [];
      }
      predictionsByStop[stopId].push(time);
    });

    // Create stop markers
    stops.forEach((stop) => {
      const attrs = stop.attributes;
      const lat = attrs.latitude;
      const lon = attrs.longitude;
      if (!lat || !lon) return;

      const stopId = stop.id;
      const stopName = attrs.name || "Stop";

      const times = predictionsByStop[stopId] || [];
      const formattedTimes = times
        .slice(0, 3)
        .map((t) => {
          const d = new Date(t);
          return isNaN(d.getTime()) ? t : d.toLocaleTimeString();
        })
        .join("<br>");

      const popupHtml = `
        <strong>${stopName}</strong><br>
        <em>Stop ID: ${stopId}</em><br><br>
        ${
          times.length
            ? `<strong>Next arrivals:</strong><br>${formattedTimes}`
            : "No upcoming predictions."
        }
      `;

      const marker = L.circleMarker([lat, lon], {
        radius: 5,
        color: "#0072ff",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 1
      }).bindPopup(popupHtml);

      marker.addTo(map);
      stopMarkers.push(marker);
    });
  } catch (err) {
    console.error("Error fetching stops/predictions:", err);
  }
}

// ===============================
// SECTION 4: Map & Sidebar Updates
// ===============================

/**
 * Update map markers with latest vehicle positions.
 * Includes:
 * - Direction filter
 * - Smooth animation
 * - Custom icons with direction arrows
 */
function updateMapWithVehicles(vehicles) {
  const seenIds = new Set();
  const selectedDirection = directionFilter.value;

  vehicles.forEach((vehicle) => {
    const id = vehicle.id;
    const attrs = vehicle.attributes;

    if (!attrs || !attrs.latitude || !attrs.longitude) return;

    // Direction filter
    if (
      selectedDirection !== "" &&
      String(attrs.direction_id) !== selectedDirection
    ) {
      return;
    }

    const lat = attrs.latitude;
    const lon = attrs.longitude;
    const route = attrs.label || "?";
    const bearing = attrs.bearing; // may be null

    const popupText = `
      <strong>Route:</strong> ${route}<br>
      <strong>Status:</strong> ${humanStatus(attrs.current_status)}<br>
      <strong>Direction:</strong> ${attrs.direction_id}<br>
      <strong>Updated:</strong> ${attrs.updated_at}
    `;

    seenIds.add(id);

    const newLatLng = L.latLng(lat, lon);

    if (busMarkers[id]) {
      // Smoothly animate from old position to new
      const oldLatLng =
        lastVehiclePositions[id] || busMarkers[id].getLatLng();
      animateMarker(busMarkers[id], oldLatLng, newLatLng);
      busMarkers[id].setPopupContent(popupText);
      busMarkers[id].setIcon(createBusIcon(route, bearing));
    } else {
      // Create new marker
      const marker = L.marker(newLatLng, {
        icon: createBusIcon(route, bearing)
      }).bindPopup(popupText);

      marker.addTo(map);
      busMarkers[id] = marker;
    }

    // Store last position
    lastVehiclePositions[id] = { lat, lon };
  });

  // Remove markers for vehicles no longer present
  Object.keys(busMarkers).forEach((id) => {
    if (!seenIds.has(id)) {
      map.removeLayer(busMarkers[id]);
      delete busMarkers[id];
      delete lastVehiclePositions[id];
    }
  });
}

function humanStatus(code) {
  const map = {
    "STOPPED_AT": "Stopped",
    "IN_TRANSIT_TO": "In Transit",
    "INCOMING_AT": "Arriving Soon"
  };
  return map[code] || "Unknown";
}

/**
 * Update the sidebar list with current vehicles.
 * Each item:
 * - Shows route badge (matching icon color)
 * - Shows status
 * - Click to zoom to bus
 */
function updateSidebar(vehicles) {
  busList.innerHTML = "";
  const selectedDirection = directionFilter.value;

  vehicles.forEach((vehicle) => {
    const attrs = vehicle.attributes;
    const route = attrs.label || "?";

    // Apply same direction filter as map
    if (
      selectedDirection !== "" &&
      String(attrs.direction_id) !== selectedDirection
    ) {
      return;
    }

    const li = document.createElement("li");

    const badge = document.createElement("div");
    badge.className = "route-badge";
    badge.style.background = routeColor(route);
    badge.textContent = route;

    const text = document.createElement("span");
    text.textContent = humanStatus(attrs.current_status);

    li.appendChild(badge);
    li.appendChild(text);

    li.addEventListener("click", () => {
      const marker = busMarkers[vehicle.id];
      if (marker) {
        map.setView(marker.getLatLng(), 15);
        marker.openPopup();
      }
    });

    busList.appendChild(li);
  });
}

// ===============================
// SECTION 5: Event Listeners & Init
// ===============================

/**
 * Apply route filter when button is clicked.
 */
applyFilterBtn.addEventListener("click", () => {
  currentRouteFilter = routeInput.value.trim();
  fetchBusLocations();
});

/**
 * Re-fetch when direction filter changes.
 */
directionFilter.addEventListener("change", () => {
  fetchBusLocations();
});

// Initial load + periodic refresh
fetchBusLocations();
setInterval(fetchBusLocations, REFRESH_INTERVAL);