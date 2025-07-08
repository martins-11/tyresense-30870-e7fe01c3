import React, { useEffect, useMemo, useState } from "react";
import RecommendationFilter from "./RecommendationFilter";
import { motion } from "framer-motion";
import Slider from "react-slick"; // Import Slider component

/**
 * TyreRecommendations:
 * - Fetches tyre recommendations based on car, location, weather, and filters.
 * - Uses OpenWeatherMap API for weather context.
 * - Filters by brand, size, budget.
 * - Shows animated tyre cards with buy & reminder buttons.
 */

// Hardcoded tyre data by brand (URLs and product links) - Consolidated from TyreBrandDetail.js
const TYRE_BRAND_DATA = {
  michelin: {
    name: "Michelin",
    tyres: [
      {
        id: "michelin_pilotsport4",
        name: "Pilot Sport 4",
        type: "Performance", // Added type
        size: "Various", // Placeholder, ideally this would come from a real data source
        price: 130, // Example price
        image_url: `/assets/michelin_pilotsport4.webp`,
        product_url: "https://www.michelin.in/auto/tyres/michelin-pilot-sport-4",
        weather: "summer", // Example weather suitability
      },
      {
        id: "michelin_pilotsport5",
        name: "Pilot Sport 5",
        type: "Performance",
        size: "Various",
        price: 145,
        image_url: `/assets/michelin_pilotsport5.jpg`,
        product_url: "https://www.michelin.in/auto/tyres/michelin-pilot-sport-5",
        weather: "summer",
      },
      {
        id: "michelin_primacy4",
        name: "Primacy 4",
        type: "All-Season",
        size: "205/55R16", // Specific size for demo
        price: 109,
        image_url: `/assets/michelin_primacy4.webp`,
        product_url: "https://www.michelin.in/auto/tyres/michelin-primacy-4",
        weather: "all",
      },
      {
        id: "michelin_crossclimate2",
        name: "CrossClimate 2 SUV",
        type: "All-Season",
        size: "Various",
        price: 120,
        image_url: `/assets/michelin_crossclimate2.jpg`,
        product_url: "https://africa.michelin.com/en/auto/tyres/michelin-crossclimate-2-suv",
        weather: "all",
      },
    ],
  },
  bridgestone: {
    name: "Bridgestone",
    tyres: [
      {
        id: "bridgestone_weathercontrol",
        name: "Weather Control A005",
        type: "All-Season",
        size: "Various",
        price: 110,
        image_url: `/assets/bridgestone_weathercontrol.png`,
        product_url: "https://www.bridgestone.co.uk/car-tyres/all-season-tyres-weather-control/a005",
        weather: "all",
      },
      {
        id: "bridgestone_turanzat005",
        name: "Turanza T005 RFT",
        type: "Touring",
        size: "195/65R15", // Specific size for demo
        price: 103,
        image_url: `/assets/bridgestone_turanzat005.jpg`,
        product_url: "https://www.bridgestone.co.in/passenger-tyres/turanza-tyres/t005-rft-t005a",
        weather: "all",
      },
      {
        id: "bridgestone_potenzasport",
        name: "Potenza Sport",
        type: "Performance",
        size: "Various",
        price: 128,
        image_url: `/assets/bridgestone_potenzasport.jpg`,
        product_url: "https://www.bridgestone.com.sg/en/tyre/potenza-sport",
        weather: "summer",
      },
      {
        id: "bridgestone_blizzaklm005",
        name: "Blizzak LM005",
        type: "Winter",
        size: "Various",
        price: 115,
        image_url: `/assets/bridgestone_blizzaklm005.jpeg`,
        product_url: "https://www.bridgestonetire.com/tire/blizzak-lm005/185-60R16/",
        weather: "winter",
      },
    ],
  },
  continental: {
    name: "Continental",
    tyres: [
      {
        id: "continental_wintercontact",
        name: "WinterContact TS 870",
        type: "Winter",
        size: "Various",
        price: 112,
        image_url: `/assets/continental_wintercontact.png`,
        product_url: "https://www.continental-tires.com/products/b2c/car/tires/wintercontact-ts-870/",
        weather: "winter",
      },
      {
        id: "continental_premiumcontact7",
        name: "PremiumContact 7",
        type: "Performance",
        size: "225/40R18", // Specific size for demo
        price: 127,
        image_url: `/assets/continental_premiumcontact2.webp`,
        product_url: "https://www.continental-tires.com/products/b2c/car/tires/premiumcontact-7/",
        weather: "summer",
      },
      {
        id: "continental_allseasoncontact",
        name: "AllSeasonContact 2",
        type: "All-Season",
        size: "Various",
        price: 108,
        image_url: `/assets/continental_allseasoncontact.jpg`,
        product_url: "https://www.continental-tires.com/products/b2c/car/tires/allseasoncontact-2/",
        weather: "all",
      },
      {
        id: "continental_sportcontact7",
        name: "SportContact 7",
        type: "Performance",
        size: "Various",
        price: 135,
        image_url: `/assets/continental_sportcontact7.webp`,
        product_url: "https://www.continental-tires.com/products/b2c/car/tires/sportcontact-7/",
        weather: "summer",
      },
    ],
  },
  pirelli: {
    name: "Pirelli",
    tyres: [
      {
        id: "pirelli_pzero",
        name: "P Zero",
        type: "Performance",
        size: "Various",
        price: 150,
        image_url: `/assets/pirelli_pzero.png`,
        product_url: "https://www.pirelli.com/tyres/en-in/car/catalogue/product/p-zero",
        weather: "summer",
      },
      {
        id: "pirelli_cinturatoallseasonsf2",
        name: "Cinturato All Season SF-2",
        type: "All-Season",
        size: "Various",
        price: 122,
        image_url: `/assets/pirelli_allseasonsf2.png`,
        product_url: "https://www.pirelli.com/tyres/en-ww/car/catalogue/product/cinturato-all-season-sf-2",
        weather: "all",
      },
      {
        id: "pirelli_wintersottozero3",
        name: "Winter Sottozero 3",
        type: "Winter",
        size: "Various",
        price: 125,
        image_url: `/assets/pirelli_sottozero.png`,
        product_url: "https://www.pirelli.com/tires/en-us/car/catalog/product/winter-sottozero-3",
        weather: "winter",
      },
      {
        id: "pirelli_cinturatop7",
        name: "Cinturato P7",
        type: "Summer", // Re-categorized based on typical P7 usage
        size: "225/45R17", // Specific size for demo
        price: 118,
        image_url: `/assets/pirelli_cinturatop7.png`,
        product_url: "https://www.pirelli.com/tyres/en-ww/car/catalogue/product/cinturato-p7",
        weather: "summer",
      },
    ],
  },
  // You can add more brands and their specific tyres here if needed
};

// Flatten the TYRE_BRAND_DATA into a single array for easier filtering
const ALL_TYRES = Object.values(TYRE_BRAND_DATA).flatMap((brand) =>
  brand.tyres.map((tyre) => ({
    ...tyre,
    brand: brand.name, // Add brand name to each tyre object
    img: tyre.image_url, // Map image_url to img for existing component usage
    url: tyre.product_url, // Map product_url to url for existing component usage
    model: tyre.name, // Map name to model for existing component usage
  }))
);

// Helpers
const uniqueFrom = (arr, key) => [...new Set(arr.map((t) => t[key]))].filter(Boolean);

function getWeatherLabel(code = "") {
  const c = code.toLowerCase();
  if (c.includes("snow")) return "winter"; // Changed to winter to match data
  if (c.includes("rain")) return "all"; // Rain can be all-season
  if (c.includes("hot") || c.includes("clear") || c.includes("sun")) return "summer";
  if (c.includes("cold") || c.includes("frost")) return "winter";
  return "all";
}

// Helper function to infer tyre type based on car
const getRecommendedTyreTypeForCar = (car) => {
  if (!car || !car.make) return null; // No specific recommendation if car details are missing

  const make = car.make.toLowerCase();
  const model = car.model ? car.model.toLowerCase() : '';
  const year = parseInt(car.year, 10); // Parse year to integer

  // --- Performance/Sporty Cars ---
  if (
    make.includes('porsche') ||
    make.includes('ferrari') ||
    make.includes('lamborghini') ||
    make.includes('mclaren') ||
    (make.includes('bmw') && (model.includes('m') || model.includes('z4'))) ||
    (make.includes('mercedes-benz') && model.includes('amg')) ||
    (make.includes('audi') && model.includes('rs')) ||
    (make.includes('ford') && model.includes('mustang')) ||
    (make.includes('chevrolet') && model.includes('corvette'))
  ) {
    return 'Performance';
  }

  // --- Luxury/Premium Sedans/SUVs (often balanced between performance and comfort) ---
  if (
    (make.includes('bmw') || make.includes('mercedes-benz') || make.includes('audi') || make.includes('lexus')) &&
    !['m', 'amg', 'rs', 'z4'].some(perf => model.includes(perf)) // Exclude obvious performance models
  ) {
    return 'Performance'; // Prioritize Performance for premium, but All-Season could also fit.
  }

  // --- General Consumer Cars (Sedans, Hatchbacks, Compact SUVs) ---
  if (
    make.includes('honda') ||
    make.includes('toyota') ||
    make.includes('hyundai') ||
    make.includes('kia') ||
    make.includes('nissan') ||
    make.includes('volkswagen') ||
    make.includes('maruti') || // Assuming Maruti for Indian context
    make.includes('tata') ||   // Assuming Tata for Indian context
    make.includes('mahindra')  // Assuming Mahindra for Indian context
  ) {
    return 'All-Season'; // Most common for daily drivers in varied climates
  }

  // Fallback for older cars or cars without specific performance connotations
  if (year && year < 2000) { // Example: assume older cars lean towards all-season
      return 'All-Season';
  }

  return null; // Default: no specific recommendation based on car
};


function TyreRecommendations({ car, userLocation, onSetReminder }) {
  const [filters, setFilters] = useState({ brand: "", size: "", budget: "" });
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Fetch weather on userLocation change
  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng) return;

    // IMPORTANT: Your API key is embedded here for immediate testing.
    // For production, consider using environment variables (e.g., .env file).
    const API_KEY = "9ea789e828700c93f3c405a8a6fa9431";
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

  // Filter tyres by filters, weather, AND CAR DETAILS
  const filteredTyres = useMemo(() => {
    const recommendedTyreType = getRecommendedTyreTypeForCar(car);

    return ALL_TYRES.filter((tyre) => {
      // Existing filters (brand, size, budget)
      if (filters.brand && tyre.brand !== filters.brand) return false;
      if (filters.size && tyre.size !== "Various" && tyre.size !== filters.size) return false; // Handle "Various" size
      if (
        filters.budget &&
        !(
          (filters.budget === "budget" && tyre.price <= 110) ||
          (filters.budget === "mid" && tyre.price > 110 && tyre.price <= 125) ||
          (filters.budget === "premium" && tyre.price > 125)
        )
      )
        return false;

      // Weather filter
      // If a weather type is active, show "all" season tyres,
      // and specific weather tyres that match the current weather.
      if (weatherType !== "all" && tyre.weather !== "all" && tyre.weather !== weatherType)
        return false;

      // NEW: Filter based on car's recommended tyre type
      if (recommendedTyreType) {
          // If the car's recommended type is "Performance",
          // allow both "Performance" and "Summer" tyres to be shown.
          // This makes the recommendations more flexible for high-performance cars.
          if (recommendedTyreType === 'Performance' && (tyre.type === 'Performance' || tyre.type === 'Summer')) {
              // This is a match, continue to next filter
          }
          // If the car's recommended type is "All-Season",
          // allow "All-Season" and "Touring" tyres.
          else if (recommendedTyreType === 'All-Season' && (tyre.type === 'All-Season' || tyre.type === 'Touring')) {
              // This is a match, continue to next filter
          }
          // For other specific recommendations (e.g., "Winter"), demand an exact match.
          else if (tyre.type !== recommendedTyreType) {
              return false; // Does not match the car's recommended type
          }
      }

      return true; // Tyre passes all filters
    });
  }, [filters, weatherType, car]); // Add 'car' to dependencies of useMemo

  // Options for filters (remain the same)
  const brandOptions = uniqueFrom(ALL_TYRES, "brand");
  const sizeOptions = uniqueFrom(ALL_TYRES, "size");
  const budgetOptions = [
    { val: "budget", label: "Budget (<£110)" },
    { val: "mid", label: "Mid (£111–125)" },
    { val: "premium", label: "Premium (>£125)" },
  ];

  // Shared styles for buttons (remain the same)
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

  // Slider settings for react-slick (remain the same)
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, infinite: false, dots: true } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1, infinite: false, dots: true } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1, infinite: false, dots: true } },
    ],
  };

  return (
    <>
      {/* Tyre replacement reminder div (remains the same) */}
      <div
        className="ts-reminder-top"
        style={{
          background: "#b4081b",
          color: "#fff",
          padding: "10px 15px",
          textAlign: "center",
          fontSize: "1.05rem",
          fontWeight: 600,
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: onSetReminder ? "block" : "none",
        }}
      >
        <p style={{ margin: 0 }}>
          Don't forget to set a reminder for your next tyre check!
          <button
            type="button"
            onClick={onSetReminder}
            style={{
              background: "#fff",
              color: "#b4081b",
              border: "none",
              borderRadius: "5px",
              padding: "5px 12px",
              marginLeft: "15px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            Set Reminder
          </button>
        </p>
      </div>

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
          role="list"
          aria-label="List of tyre recommendations"
          style={{ paddingBottom: 8 }}
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
            <Slider {...sliderSettings}>
              {filteredTyres.map((tyre, idx) => (
                <div key={tyre.id} style={{ padding: "0 8px" }}>
                  <motion.article
                    className="ts-tyre-card"
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
                      height: "auto",
                    }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    initial={{ y: 22, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.27 + idx * 0.05 }}
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
                      animate={{ rotate: [0, 360] }}
                      transition={{ repeat: Infinity, duration: 6 + idx * 0.5, ease: "linear" }}
                    />
                    <div style={{ color: "#b4081b", fontWeight: 700, fontSize: "1.03rem" }}>
                      {tyre.brand}
                    </div>
                    <div style={{ color: "#edeef0", fontWeight: 600, fontSize: "0.98rem" }}>
                      {tyre.model}
                    </div>
                    <div style={{ color: "#7d7d85", fontSize: "0.91rem" }}>{tyre.type}</div>
                    <div style={{ color: "#edeef0", marginBottom: 3 }}>{tyre.size}</div> {/* Displaying size below type */}
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
                  </motion.article>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </section>
    </>
  );
}

export default TyreRecommendations;