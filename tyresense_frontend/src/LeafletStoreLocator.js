import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in React Leaflet for marker icons (important for webpack setups)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// To test in London, set this as the default
const DEFAULT_CENTER = [51.5081, -0.1281]; // Central London (fallback and test location)
// For Chennai testing, you would temporarily change this:
// const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai (fallback and test location)

const DEFAULT_ZOOM = 13;
const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"; // Standard Overpass API endpoint

// Function to generate the Overpass query
const generateOverpassQuery = (lat, lng, radius_m = 10000) => { // Increased radius to 10km
  return `
    [out:json][timeout:60];
    (
      node["shop"="tyres"](around:${radius_m},${lat},${lng});
      way["shop"="tyres"](around:${radius_m},${lat},${lng});
      relation["shop"="tyres"](around:${radius_m},${lat},${lng});

      node["shop"="car_repair"](around:${radius_m},${lat},${lng});
      way["shop"="car_repair"](around:${radius_m},${lat},${lng});
      relation["shop"="car_repair"](around:${radius_m},${lat},${lng});

      node["service:vehicle:tyres"="yes"](around:${radius_m},${lat},${lng});
      way["service:vehicle:tyres"="yes"](around:${radius_m},${lat},${lng});
      relation["service:vehicle:tyres"="yes"](around:${radius_m},${lat},${lng});

      // You could add more specific ones like:
      // node["amenity"="car_wash"]["service:tyres"="yes"](around:${radius_m},${lat},${lng});
      // ... or filter by name/description if needed, but that makes queries complex.

    );
    out center;
  `;
};

// Component that pans/zooms to user's location if available and places a marker
// Also fetches nearby tyre shops based on user's location
function MapLogic({ setUserPosition, setTyreStores }) {
  const map = useMap();

  const fetchTyreStores = useCallback(async (lat, lng) => {
    const query = generateOverpassQuery(lat, lng);
    console.log("Overpass Query:", query); // Log the query to see what's sent
    try {
      const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Overpass API Response:", data); // Log the full response

      const newStores = data.elements.map(element => ({
        name: element.tags?.name || "Unnamed Tyre Shop",
        position: [element.lat || element.center?.lat, element.lon || element.center?.lon], // Use center.lat/lon for ways/relations
        id: element.id,
        address: element.tags?.['addr:full'] ||
                 (element.tags?.['addr:housenumber'] ? element.tags['addr:housenumber'] + ' ' : '') +
                 (element.tags?.['addr:street'] || element.tags?.street || '') +
                 (element.tags?.city ? ', ' + element.tags.city : '') ||
                 'Address not available',
        // Pass all tags for more detailed popups if needed
        tags: element.tags
      })).filter(store => store.position[0] && store.position[1]); // Filter out elements without valid coordinates
      setTyreStores(newStores);
      console.log("Processed Tyre Stores:", newStores); // Log processed stores
    } catch (error) {
      console.error("Error fetching tyre shops from Overpass API:", error);
      // Potentially set an error state or display a message to the user
    }
  }, [setTyreStores]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser. Using default location.");
      setUserPosition(null);
      fetchTyreStores(DEFAULT_CENTER[0], DEFAULT_CENTER[1]); // Use default center for fetching
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const userPos = [userLat, userLng];
        map.setView(userPos, 15);
        setUserPosition(userPos);
        fetchTyreStores(userLat, userLng);
      },
      (err) => {
        console.warn("Geolocation failed or denied:", err);
        setUserPosition(null);
        fetchTyreStores(DEFAULT_CENTER[0], DEFAULT_CENTER[1]); // Fallback fetch
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Added options for better accuracy
    );

    // Optional: Fetch new stores when the map view changes (e.g., user drags map)
    // This can be resource-intensive, so enable with caution for MVP
    // const handleMoveEnd = () => {
    //   const center = map.getCenter();
    //   fetchTyreStores(center.lat, center.lng);
    // };
    // map.on('moveend', handleMoveEnd);
    // return () => {
    //   map.off('moveend', handleMoveEnd);
    // };

  }, [map, setUserPosition, fetchTyreStores]);

  return null;
}

export default function LeafletStoreLocator() {
  const [userPosition, setUserPosition] = useState(null);
  const [tyreStores, setTyreStores] = useState([]);

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapLogic setUserPosition={setUserPosition} setTyreStores={setTyreStores} />

        {userPosition && (
          <Marker position={userPosition}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {tyreStores.map((store) => (
          <Marker key={store.id} position={store.position}>
            <Popup>
              <strong>{store.name}</strong>
              <br />
              {store.address}
              {store.tags?.phone && <><br/>Phone: {store.tags.phone}</>}
              {store.tags?.opening_hours && <><br/>Hours: {store.tags.opening_hours}</>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}