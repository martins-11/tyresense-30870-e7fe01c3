import React, { useEffect, useMemo, useState } from "react";
import RecommendationFilter from "./RecommendationFilter";
import { motion } from "framer-motion";

/**
* TyreRecommendations:
* - Fetches tyre recommendations based on car, location, weather, and filters.
* - Uses OpenWeatherMap API for weather context.
* - Filters by brand, size, budget.
* - Shows animated tyre cards with buy & reminder buttons.
*/

const DEMO_TYRES = [
{
 id: "p7",
 brand: "Pirelli",
 model: "Cinturato P7",
 type: "Summer",
 size: "225/45R17",
 price: 118,
 url: "https://www.pirelli.com/tyres/en-ww/car/catalogue/product/cinturato-p7",
 img: `/assets/20250605_071317_Pirelli-Cintaurato-P7.jpg`,
 weather: "summer",
},
{
 id: "primacy4",
 brand: "Michelin",
 model: "Primacy 4",
 type: "All-Season",
 size: "205/55R16",
 price: 109,
 url: "https://www.michelin.co.uk/auto/tyres/michelin-primacy-4",
 img: `/assets/20250605_071317_michelin-tyres.jpg`,
 weather: "all",
 },
 {
 id: "contisport",
 brand: "Continental",
 model: "PremiumContact 6",
 type: "Performance",
 size: "225/40R18",
 price: 127,
 url: "https://www.continental-tires.com/in/en/products/car/tyres/premiumcontact-6/",
 img: `/assets/20250605_071316_continental_pp_conti_cityplus.jpg`,
 weather: "summer",
 },
 {
 id: "turanza",
 brand: "Bridgestone",
 model: "Turanza T005",
 type: "Touring",
 size: "195/65R15",
 price: 103,
 url: "https://www.bridgestone.co.uk/car-tyres/summer-tyres-turanza/t005",
 img: `/assets/20250605_071315_Bridgestone-Turanza-T005-1.jpg`,
 weather: "all",
 },
];

// Helpers
const uniqueFrom = (arr, key) => [...new Set(arr.map((t) => t[key]))].filter(Boolean);

function getWeatherLabel(code = "") {
 const c = code.toLowerCase();
 if (c.includes("snow")) return "snow";
 if (c.includes("rain")) return "rain";
 if (c.includes("hot") || c.includes("clear")) return "summer";
 if (c.includes("cold") || c.includes("frost")) return "winter";
 if (c.includes("all")) return "all";
 return "all";
}

function TyreRecommendations({
 car,
 userLocation,
 onSetReminder,
}) {
 const [filters, setFilters] = useState({ brand: "", size: "", budget: "" });
 const [weather, setWeather] = useState(null);
 const [weatherLoading, setWeatherLoading] = useState(false);
 const [weatherError, setWeatherError] = useState(null);

 // Fetch weather on userLocation change
  useEffect(() => {
  if (!userLocation?.lat || !userLocation?.lng) return;

 // Use window.REACT_APP_OWM_KEY if available, else fallback to hardcoded string
 const API_KEY =
 (typeof window !== "undefined" && window.REACT_APP_OWM_KEY)
 ? window.REACT_APP_OWM_KEY
 : "<YOUR_OPENWEATHERMAP_KEY>";
  setWeatherLoading(true);
  setWeatherError(null);

fetch(
 `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lng}&appid=${API_KEY}&units=metric`
 )
 .then((res) => {
 if (!res.ok) throw new Error("Failed to fetch weather");
 return res.json();
 })
.then((data) => {
 setWeather(data);
 setWeatherLoading(false);
 })
 .catch((err) => {
 setWeatherLoading(false);
 setWeatherError(err.message || "Error fetching weather");
 });
 }, [userLocation?.lat, userLocation?.lng]);

 const weatherType = useMemo(() => {
 if (weather?.weather?.length) {
 return getWeatherLabel(weather.weather[0].main);
 }
 return "all";
 }, [weather]);

 // Filter tyres by filters and weather
 const filteredTyres = useMemo(() => {
 return DEMO_TYRES.filter((tyre) => {
 if (filters.brand && tyre.brand !== filters.brand) return false;
 if (filters.size && tyre.size !== filters.size) return false;
 if (
 filters.budget &&
 !(
 (filters.budget === "budget" && tyre.price <= 110) ||
 (filters.budget === "mid" && tyre.price > 110 && tyre.price <= 125) ||
 (filters.budget === "premium" && tyre.price > 125)
 )
 )
 return false;
 if (weatherType !== "all" && tyre.weather !== "all" && tyre.weather !== weatherType)
 return false;
 return true;
 });
}, [filters, weatherType]);

 // Options for filters
 const brandOptions = uniqueFrom(DEMO_TYRES, "brand");
 const sizeOptions = uniqueFrom(DEMO_TYRES, "size");
 const budgetOptions = [
 { val: "budget", label: "Budget (<£110)" },
 { val: "mid", label: "Mid (£111–125)" },
 { val: "premium", label: "Premium (>£125)" },
 ];

 // Shared styles to avoid repetition
 const btnPrimaryStyle = {
 marginTop: 7,
 fontSize: "0.97rem",
 borderRadius: 7,
 border: "1.3px solid #b4081b",
 background: "#b4081b",
 color: "#fff",
 fontWeight: 800,
 padding: "6px 17px",
 boxShadow: "none",
 cursor: "pointer",
 transition: "background 0.14s, color 0.13s, border 0.13s",
 };

 return (
    <>
      {/* Tyre replacement reminder div */}
      
      <section className="ts-section ts-tyre-recommend-section" aria-label="Tyre recommendations">
        <header style={{ marginBottom: 16 }}>
          <h2 style={{ color: "#b4081b", fontWeight: 800, letterSpacing: "0.08em" }}>
            Tyre Recommendations
          </h2>
          <p className="tyre-showcase-desc" style={{ color: "#7d7d85", opacity: 0.8 }}>
            Personalised for your car, location and weather.
          </p>
          {car && (
            <div
              style={{ color: "#7d7d85", fontWeight: 600 }}
              aria-label={`Selected car: ${car?.year ?? ""} ${car?.make ?? ""} ${car?.model ?? ""}`}
            >
              {car?.year ?? ""} {car?.make ?? ""} {car?.model ?? ""}
            </div>
          )}
          {weatherLoading && (
            <span style={{ color: "#a9aaae", fontWeight: 600 }} role="status" aria-live="polite">
              Loading weather...
            </span>
          )}
          {weatherError && (
            <span style={{ color: "#d9534f", fontWeight: 600 }} role="alert">
              {weatherError}
            </span>
          )}
          {weather && !weatherLoading && !weatherError && (
            <span style={{ color: "#b4081b", fontWeight: 600 }}>
              Weather: {weather.weather ? weather.weather[0].description : "N/A"}{" "}
              {weather.main ? `(${weather.main.temp}°C)` : ""}
            </span>
          )}
        </header>

        <RecommendationFilter
          filters={filters}
          onFiltersChange={setFilters}
          brandOptions={brandOptions}
          sizeOptions={sizeOptions}
          budgetOptions={budgetOptions.map((b) => b.val)}
        />

        <div
          className="ts-tyre-list"
          role="list"
          aria-label="List of tyre recommendations"
          style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}
        >
          {filteredTyres.length === 0 ? (
            <div
              style={{ color: "#b4081b", fontWeight: 700, padding: 18 }}
              role="alert"
              aria-live="assertive"
            >
              No matching tyres found for your selection.
            </div>
          ) : (
            filteredTyres.map((tyre, idx) => (
              <motion.article
                className="ts-tyre-card"
                key={tyre.id}
                role="listitem"
                tabIndex={0}
                style={{
                  background: "#232327",
                  borderRadius: "13px",
                  boxShadow: "0 5px 15px #18181b33",
                  cursor: "pointer",
                  padding: "8px",
                  minWidth: 132,
                  minHeight: 160,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  outline: "none",
                }}
                whileHover={{ scale: 1.11, rotate: -2 }}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.27 + idx * 0.1 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") window.open(tyre.url, "_blank");
                }}
                aria-label={`${tyre.brand} ${tyre.model} tyre, size ${tyre.size}, type ${tyre.type}`}
              >
                <motion.img
                  src={tyre.img}
                  alt={`${tyre.brand} ${tyre.model} tyre`}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    boxShadow: "0 0 8px #b4081b55",
                    marginBottom: 4,
                    objectFit: "cover",
                    filter: "brightness(1.09)",
                    background: "#18181b",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                  draggable={false}
                  animate={{ rotate: [0, 720] }}
                  transition={{ repeat: Infinity, duration: 9 + idx * 1, ease: "linear" }}
                />
                <div style={{ color: "#b4081b", fontWeight: 700, fontSize: "1.03rem" }}>
                  {tyre.brand}
                </div>
                <div style={{ color: "#edeef0", fontWeight: 600, fontSize: "0.98rem" }}>
                  {tyre.model}
                </div>
                <div style={{ color: "#7d7d85", fontSize: "0.91rem" }}>{tyre.size}</div>
                <div style={{ color: "#edeef0", marginBottom: 3 }}>{tyre.type}</div>
                {/* Removed Price Line */}
                <button
                  type="button"
                  style={btnPrimaryStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(tyre.url, "_blank");
                  }}
                  aria-label={`Buy ${tyre.brand} ${tyre.model} now`}
                >
                  Buy Now
                </button>
                {/* Removed Remind Me Button */}
              </motion.article>
            ))
          )}
        </div>
      </section>
    </>
  );
}

export default TyreRecommendations;