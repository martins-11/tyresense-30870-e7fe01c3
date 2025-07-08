import React, { useEffect, useRef, useState, useCallback } from "react"; // Add useCallback
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import "./TyreSenseMain.css"; // Ensure your CSS file is correctly linked
import CarDetailsInput from "./CarDetailsInput";
import GoogleMapsStoreLocator from "./GoogleMapsStoreLocator";
import TyreBrandDetail from "./TyreBrandDetail";
import AnimatedCarIntro from "./AnimatedCarIntro";
import TyreRecommendations from "./TyreRecommendations";
import TyreLogoSVG from "./TyreLogoSVG";
import TawkToChatWidget from './TawkToChatWidget';

/**
 * MAIN_TYRES - main grid source for Porsche-style cards.
 * Replace/augment with real data as needed.
 */
const MAIN_TYRES = [
  {
    id: "pirelli_p7",
    brand: "Pirelli",
    model: "Cinturato P7",
    type: "Summer",
    size: "225/45R17",
    price: 118,
    url: "https://www.pirelli.com/tyres/en-ww/cinturato/p7",
    img: `${process.env.PUBLIC_URL || ""}/assets/pirelli-brand-cover.jpg`,
    desc: "Performance meets Innovation.",
    brandId: "pirelli",
    img_alt: "Pirelli Cinturato P7 tyre photo, full detail"
  },
  {
    id: "michelin_ps4",
    brand: "Michelin",
    model: "Pilot Sport 4",
    type: "Performance",
    size: "225/40R18",
    price: 127,
    url: "https://www.michelin.co.uk/auto/tyres/michelin-pilot-sport-4",
    img: `${process.env.PUBLIC_URL || ""}/assets/michelin_brand_cover.jpg`,
    desc: "Motion for Life.",
    brandId: "michelin",
    img_alt: "Michelin Pilot Sport 4 tyre photo, full detail"
  },
  {
    id: "continental_sport",
    brand: "Continental",
    model: "SportContact 6",
    type: "Performance",
    size: "225/40R18",
    price: 127,
    url: "https://www.continental-tires.com/uk/en/b2c/car/tires/contisportcontact-6.html",
    img: `${process.env.PUBLIC_URL || ""}/assets/continental-brand-cover1.jpg`,
    desc: "The Future in Motion.",
    brandId: "continental",
    img_alt: "Continental SportContact 6 tyre photo, full detail"
  },
  {
    id: "bridgestone_turanza",
    brand: "Bridgestone",
    model: "Turanza T005",
    type: "Touring",
    size: "195/65R15",
    price: 103,
    url: "https://www.bridgestone.co.uk/our-products/car-tyres/turanza-t005",
    img: `${process.env.PUBLIC_URL || ""}/assets/bridgestone-brand-cover.jpg`,
    desc: "Solutions for your journey.",
    brandId: "bridgestone",
    img_alt: "Bridgestone Turanza T005 tyre photo, full detail"
  }
];

// LocalStorage helpers (unchanged, minimal)
function saveCarToLS(car) {
  window.localStorage.setItem("tyrewiseCar", JSON.stringify(car));
}
function loadCarFromLS() {
  try { return JSON.parse(window.localStorage.getItem("tyrewiseCar") || "null"); }
  catch { return null; }
}

/** PUBLIC_INTERFACE
 * TyreSenseMain - container for TyreSense app
 * Handles navigation using react-router-dom for client-side routing.
 */

function MainTyreSenseRoutes() {
  // Initialize the stage to "BLACKOUT" to trigger intro animation
  const [stage, setStage] = useState("BLACKOUT");
  const logoFadeInTimeout = useRef();

  const [userCar, setUserCar] = useState(loadCarFromLS());

  // --- Geolocation for map ---
  const [userLocation, setUserLocation] = useState(null);
  // State for found stores
  const [foundTyreStores, setFoundTyreStores] = useState([]);

  // NEW: Callback to sort and limit stores before setting state
  const handleStoresFound = useCallback((stores) => {
    // Ensure stores have a valid distance property
    const validStores = stores.filter(store => typeof store.distance === 'number' && !isNaN(store.distance));

    // Sort stores by distance in ascending order
    const sortedStores = [...validStores].sort((a, b) => a.distance - b.distance);

    // Take only the first 10 nearest stores for display
    const top10Stores = sortedStores.slice(0, 10);

    setFoundTyreStores(top10Stores);
  }, []); // useCallback memoizes this function, good for performance


  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Re-introduce animation-related useEffects and functions
  useEffect(() => {
    setStage("CAR_ANIM"); // Start the car animation on component mount
  }, []);

  const handleAnimatedCarDone = () => {
    setStage("LOGO_FADEIN"); // After car animation, fade in the logo
    logoFadeInTimeout.current = setTimeout(() => {
      setStage("LIFT_BLACKOUT"); // Lift the blackout
      setTimeout(() => setStage("SHOW_MAIN"), 540); // Show main content after blackout lifts
    }, 660);
  };

  // Cleanup for the timeout
  useEffect(() => {
    return () => {
      if (logoFadeInTimeout.current) clearTimeout(logoFadeInTimeout.current);
    };
  }, []);

  const showBlackout = stage !== "SHOW_MAIN";
  const blackoutStyle = showBlackout
    ? { opacity: stage === "LIFT_BLACKOUT" ? 0 : 1, transition: "opacity 540ms cubic-bezier(.71,0,.38,1)", pointerEvents: "all", zIndex: 2000 }
    : { opacity: 0, pointerEvents: "none" };
  const showAnimatedCar = stage === "CAR_ANIM" || stage === "LOGO_FADEIN" || stage === "LIFT_BLACKOUT";
  const showNavbarLogo = stage === "SHOW_MAIN";

  // For navigation
  const navigate = useNavigate();

  // Brand selection navigation
  const handleBrandSelect = (brand) => {
    // Go to /brand/<brand.id> page
    if (brand && brand.id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate(`/brand/${brand.id}`);
    }
  };

  // Function to handle opening the store in Google Maps
  const handleViewOnGoogleMaps = (store) => {
    if (store.position && store.position.length === 2) {
      const lat = store.position[0];
      const lng = store.position[1];
      const name = encodeURIComponent(store.name); // Encode name for URL
      const address = encodeURIComponent(store.address);

      // Preferred: Universal link that works on web and mobile (opens app if installed)
      // Using 'search' query parameter (q) is more robust for generic places
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${store.id || ''}&q=${name},${address}`;

      window.open(googleMapsUrl, "_blank");
    } else {
      alert("Location data not available for this store.");
    }
  };


  return (
    <div className="tyresense-main">
      {/* Persistent Porsche-minimal logo as navbar */}
      {showNavbarLogo && (
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 100,
            background: "var(--porsche-black)",
            borderBottom: "1px solid var(--porsche-border-light)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 74,
            padding: 0,
            boxShadow: "0 2px 11px #11111417"
          }}
        >
          {/* Updated: Prominent tyre-themed SVG logo in header */}
          <div
            className="ts-animated-car-navbar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minWidth: 155,
              maxWidth: 340,
              padding: "0 18px",
              gap: 10
            }}
          >
            <TyreLogoSVG
              style={{
                width: 54,
                height: 54,
                minWidth: 36,
                marginRight: 13,
                verticalAlign: "middle",
                flex: "0 0 auto",
                filter: "drop-shadow(0 0 13px #b4081b21)"
              }}
            />
            <span
              className="ts-animated-car-title"
              style={{
                fontWeight: 900,
                fontSize: "1.25rem",
                letterSpacing: "0.17em",
                color: "#fff",
                textShadow: "0 0 13px #e1060078, 0 0.5px 8px #23232733",
                filter: "brightness(1.13) blur(.01px)",
                verticalAlign: "middle",
                marginLeft: 1,
                display: "inline-block",
                background: "none",
                lineHeight: 1.1,
                textTransform: "uppercase"
              }}
            >
              TyreSense
            </span>
          </div>
        </nav>
      )}
      {/* Blackout overlay (will now show during animation) */}
      {showBlackout && (
        <div
          className="blackout-overlay"
          style={{
            ...blackoutStyle,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            background: "#08080B",
            willChange: "opacity",
            pointerEvents: blackoutStyle.opacity === 0 ? "none" : "all",
            zIndex: 2000,
          }}
        ></div>
      )}
      {/* Animated car intro staged in center (will now show during animation) */}
      {showAnimatedCar && (
        <AnimatedCarIntro visible onAnimationComplete={handleAnimatedCarDone} />
      )}

      <Routes>
        {/* Main page route */}
        <Route
          path="/"
          element={
            stage === "SHOW_MAIN" && (
              <>
                {/* Porsche.com-style looping hero video */}
                <div className="porsche-hero-bg-video-container">
                  <video
                    className="porsche-hero-bg-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={"/assets/porsche_hero_fallback.jpg"}
                  >
                    <source
                      src="https://storage.googleapis.com/kavia-public-assets/porsche_tyreloop_trimmed.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <div className="porsche-hero-frost" />
                </div>
                {/* Main overlayed content */}
                <div className="porsche-main-content" style={{ maxWidth: 1320, margin: "0 auto", padding: "10px 8vw 28px 8vw" }}>
                  <h1
                    className="porsche-title"
                    style={{
                      marginTop: 0,
                      color: "#fff",
                      fontWeight: 900,
                      textTransform: "uppercase"
                    }}
                  >
                    TyreSense
                  </h1>
                  <div
                    className="porsche-subtitle"
                    style={{
                      fontWeight: 600,
                      fontSize: "1.50rem",
                      color: "#b0b0b0",
                      marginBottom:60,
                      marginTop: 50,
                      marginLeft: 40
                    }}
                  >
                    Premium tyres. <br/> <br/>
                    Engineered for performance. <br/> <br/>
                  </div>
                    <h2 className="brands-title">Brands</h2>
                  {/* --- Porsche-style full-width main tyres grid: replaces ALL previous grid/card JSX --- */}
                  <section
                    className="porsche-dual-grid"
                    aria-label="TyreSense main Porsche-style tyre grid"
                  >
                    {MAIN_TYRES.map((tyre, idx) => (
                      <article
                        key={tyre.id || idx}
                        className="porsche-tyre-card"
                        role="button"
                        tabIndex={0}
                        aria-label={`View details for ${tyre.brand} ${tyre.model}`}
                        aria-pressed="false"
                        aria-haspopup="dialog"
                        style={{ cursor: "pointer", outline: "none" }}
                        // Clicking the whole card navigates to brand page
                        onClick={() => {
                          handleBrandSelect({
                            id: tyre.brandId || (typeof tyre.brand === "string" ? tyre.brand.toLowerCase() : tyre.brand),
                            name: tyre.brand,
                          });
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" ||
                            e.key === " " ||
                            e.keyCode === 13 ||
                            e.keyCode === 32
                          ) {
                            e.preventDefault();
                            handleBrandSelect({
                              id: tyre.brandId || (typeof tyre.brand === "string" ? tyre.brand.toLowerCase() : tyre.brand),
                              name: tyre.brand,
                            });
                          }
                        }}
                      >
                        <div className="porsche-tyre-card-img-wrapper">
                          <img
                            src={tyre.img || tyre.image || ""}
                            alt={`${tyre.brand} premium tyre`}
                            className="porsche-tyre-card-image"
                            loading="lazy"
                            draggable={false}
                            // Inline styles will be overridden by CSS if you set them in TyreSenseMain.css
                            // Keep these as fallbacks or for specific overrides
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              background: "#18181b",
                              margin: "0 auto",
                              borderRadius: "var(--porsche-card-radius-sm)"
                            }}
                          />
                          <div className="porsche-card-gradient-hover" aria-hidden="true" />
                        </div>
                        <div className="porsche-tyre-card-content">
                          <span className="porsche-tyre-brand">{tyre.brand}</span>
                          {/* Removed model, type, size, price, desc */}
                          <button
                            className="porsche-tyre-card-btn" // This class will be styled for red accent
                            aria-label={`View ${tyre.brand} brand details`} // Updated ARIA label
                            tabIndex={0}
                            onClick={e => {
                              e.stopPropagation(); // Prevent parent article's click
                              handleBrandSelect({
                                id: tyre.brandId || (typeof tyre.brand === "string" ? tyre.brand.toLowerCase() : tyre.brand),
                                name: tyre.brand,
                              });
                            }}
                            onKeyDown={e => {
                              if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
                                e.stopPropagation();
                                handleBrandSelect({
                                  id: tyre.brandId || (typeof tyre.brand === "string" ? tyre.brand.toLowerCase() : tyre.brand),
                                  name: tyre.brand,
                                });
                              }
                            }}
                          >
                            Explore
                          </button>
                        </div>
                      </article>
                    ))}
                  </section>
                  {/* --- END Porsche-style Porsche-dual-grid block --- */}

                  <section style={{ maxWidth: 930, margin: "0 auto", padding: "24px 0" }}>
                    <CarDetailsInput
                      onSubmit={car => { setUserCar(car); saveCarToLS(car); }}
                      initialCar={userCar}
                      persistCar={saveCarToLS}
                    />
                  </section>

                  {/* Tyre Recommendations section */}
                  <section style={{ maxWidth: 900, margin: "30px auto 0 auto" }}>
                    <TyreRecommendations
                      car={userCar}
                      userLocation={userLocation}
                      userTyreData={null}
                      persistTyreData={() => {}}
                    />
                  </section>

                  {/* Map section */}
                  <section style={{ maxWidth: 900, margin: "26px auto 0 auto", padding: "0 13px" }}>
                    <h2 className="map-title" style={{ color: "#fff", textAlign: "center", marginBottom: "20px", fontWeight: 700, fontSize: "2rem" }}>Find Tyre Stores on Map</h2>
                    {/* Pass our new handler function */}
                    <GoogleMapsStoreLocator onStoresFound={handleStoresFound} />
                  </section>

                  {/* Display found tyre stores here */}
                  {foundTyreStores.length > 0 && (
                    <section style={{ maxWidth: 900, margin: "26px auto 0 auto", padding: "0 13px" }}>
                        <h2 className="map-title" style={{ color: "#fff", textAlign: "center", marginBottom: "20px", fontWeight: 700, fontSize: "2rem" }}>Tyre Stores Found Nearby</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px',
                            padding: '0 10px'
                        }}>
                            {foundTyreStores.map(store => (
                                <div key={store.id} style={{
                                    background: 'var(--porsche-black-alt, #1a1a1a)', /* Fallback if not defined in CSS */
                                    color: '#fff',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                    border: '1px solid var(--porsche-border-light, #2c2c2c)', /* Fallback */
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--porsche-red, #e10600)' }}>{store.name}</h3> {/* Fallback */}
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#ccc' }}>{store.address}</p>
                                    {/* Display distance in a user-friendly format (e.g., km) */}
                                    {store.distance !== undefined && (
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#aaa' }}>
                                            Distance: {store.distance < 1000 ? `${store.distance.toFixed(0)} m` : `${(store.distance / 1000).toFixed(1)} km`}
                                        </p>
                                    )}
                                    {store.tags?.phone && <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#aaa' }}>Phone: {store.tags.phone}</p>}
                                    {store.tags?.opening_hours && <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#aaa' }}>Hours: {store.tags.opening_hours}</p>}
                                    <button
                                        onClick={() => handleViewOnGoogleMaps(store)}
                                        style={{
                                            background: 'var(--porsche-red, #e10600)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '5px',
                                            padding: '10px 15px',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            marginTop: 'auto', // Push button to bottom
                                            alignSelf: 'flex-start', // Align button to start
                                            transition: 'background-color 0.2s ease-in-out'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--porsche-red-hover, #b40400)'} // Fallback
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--porsche-red, #e10600)'} // Fallback
                                    >
                                        View on Google Maps
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                  )}
                </div>
              </>
            )
          }
        />
        {/* Brand details route */}
        <Route
          path="/brand/:brandId"
          element={
            stage === "SHOW_MAIN" && (
              <BrandDetailRoute
                onBackToList={() => {
                  navigate("/");
                }}
              />
            )
          }
        />
        {/* Fallback - could add 404 here */}
      </Routes>
      {/* Place the Tawk.to chat widget component here */}
      <TawkToChatWidget />

      {/* Footer */}
      <footer className="app-footer">
          © {new Date().getFullYear()} TyreSense, All rights reserved
      </footer>
    </div>
  );
}


/**
 * Wrapper for TyreBrandDetail that remounts on brand change (keyed by brandId)
 * This solves any React mount issues if <TyreBrandDetail /> was not updating on navigation
 */
function BrandDetailRoute({ onBackToList }) {
  const { brandId } = useParams();
  const brand = brandId ? { id: brandId } : undefined;
  return (
    <TyreBrandDetail
      brand={brand}
      onBack={onBackToList}
      key={brandId}
    />
  );
}

/**
 * PUBLIC_INTERFACE
 * TyreSenseMain: Only renders the main app routes and UI, does NOT wrap with <Router>.
 * The SPA <Router> must be provided at the true app root (index.js) for correct in-app navigation/history behavior.
 */
function TyreSenseMain() {
  return <MainTyreSenseRoutes />;
}

export default TyreSenseMain;