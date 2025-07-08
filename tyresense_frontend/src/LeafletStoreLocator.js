import React, { useState, useEffect, useCallback, useRef } from "react"; // Add useRef
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

const DEFAULT_CENTER = [51.5081, -0.1281]; // Central London (fallback and test location)
// const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai (fallback and test location)

const DEFAULT_ZOOM = 13;
const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"; // Standard Overpass API endpoint

/**
 * Calculates the Haversine distance between two geographical points.
 * @param {number} lat1 Latitude of point 1 (in degrees)
 * @param {number} lon1 Longitude of point 1 (in degrees)
 * @param {number} lat2 Latitude of point 2 (in degrees)
 * @param {number} lon2 Longitude of point 2 (in degrees)
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
}

// Function to generate the Overpass query
const generateOverpassQuery = (lat, lng, radius_m = 10000) => {
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
    );
    out center;
  `;
};

function MapLogic({ setUserPosition, setTyreStores }) {
  const map = useMap();
  const mountedRef = useRef(true); // Use a ref to track if component is mounted

  const fetchTyreStores = useCallback(async (currentLat, currentLng) => {
    const query = generateOverpassQuery(currentLat, currentLng);
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
      let newStores = data.elements.map(element => {
        const position = [element.lat || element.center?.lat, element.lon || element.center?.lon];
        return {
          name: element.tags?.name || "Unnamed Tyre Shop",
          position: position,
          id: element.id,
          address: element.tags?.['addr:full'] ||
                   (element.tags?.['addr:housenumber'] ? element.tags['addr:housenumber'] + ' ' : '') +
                   (element.tags?.['addr:street'] || element.tags?.street || '') +
                   (element.tags?.city ? ', ' + element.tags.city : '') ||
                   'Address not available',
          tags: element.tags,
          distance: position[0] && position[1]
                      ? haversineDistance(currentLat, currentLng, position[0], position[1])
                      : Infinity, // Assign Infinity if position is invalid
        };
      }).filter(store => store.position[0] && store.position[1]); // Filter out elements without valid coordinates

      // Only update state if component is still mounted
      if (mountedRef.current) {
        setTyreStores(newStores);
      }
    } catch (error) {
      console.error("Error fetching tyre shops from Overpass API:", error);
    }
  }, [setTyreStores]);

  useEffect(() => {
    mountedRef.current = true; // Set ref to true when component mounts

    // Early exit if map instance is not yet available from useMap()
    if (!map) {
      console.warn("Map instance not available yet in MapLogic.");
      return;
    }

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser. Using default location.");
      setUserPosition(null);
      fetchTyreStores(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      return;
    }

    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Crucial: Only proceed if component is still mounted
        if (mountedRef.current) {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const userPos = [userLat, userLng];

          // More robust check: Ensure map is not disposed and has its container
          // _container and _leaflet_id are internal Leaflet properties
          if (map._container && map._container._leaflet_id !== undefined) {
             map.setView(userPos, 15); // Set map view to user's position
          } else {
            console.warn("Map container or ID not found. Map might be unmounted or invalid.");
            // If map is invalid, we still want to set user position and fetch stores
            // but we cannot set the view.
          }

          setUserPosition(userPos);
          fetchTyreStores(userLat, userLng);
        }
      },
      (err) => {
        // Only update state if component is still mounted
        if (mountedRef.current) {
          console.warn("Geolocation failed or denied:", err);
          setUserPosition(null);
          fetchTyreStores(DEFAULT_CENTER[0], DEFAULT_CENTER[1]); // Fallback fetch
        }
      },
      geolocationOptions
    );

    // Cleanup function: Set mountedRef to false when component unmounts
    return () => {
      mountedRef.current = false;
    };
  }, [map, setUserPosition, fetchTyreStores]); // map is a dependency here

  return null;
}

// LeafletStoreLocator now accepts a prop to pass back the found stores
export default function LeafletStoreLocator({ onStoresFound }) {
  const [userPosition, setUserPosition] = useState(null);
  const [tyreStores, setTyreStores] = useState([]);

  // Use an effect to call onStoresFound whenever tyreStores changes
  useEffect(() => {
    if (onStoresFound) {
      onStoresFound(tyreStores);
    }
  }, [tyreStores, onStoresFound]);

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer
        center={userPosition || DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Pass setTyreStores to MapLogic so it can update the state */}
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