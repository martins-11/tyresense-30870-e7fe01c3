// src/TyreSenseMain.js -- This file should ONLY contain this code.
import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import "./TyreSenseMain.css";
import ReminderPopup from "./ReminderPopup";
import CarDetailsInput from "./CarDetailsInput";
import GoogleMapsStoreLocator from "./GoogleMapsStoreLocator";
import TyreTypesShowcase from "./TyreTypesShowcase"; // Imported
import TyreBrandDetail from "./TyreBrandDetail";
import AnimatedCarIntro from "./AnimatedCarIntro";
import TyreRecommendations from "./TyreRecommendations";
import TyreLogoSVG from "./TyreLogoSVG";

// Correct import path for TawkToChatWidget (assuming it's in src)
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
    img: `${process.env.PUBLIC_URL || ""}/assets/20250605_071317_Pirelli-Cintaurato-P7.jpg`,
    desc: "Performance meets Innovation.",
    brandId: "pirelli",
    img_alt: "Pirelli Cinturato P7 tyre photo"
  },
  {
    id: "michelin_ps4",
    brand: "Michelin",
    model: "Pilot Sport 4",
    type: "Performance",
    size: "225/40R18",
    price: 127,
    url: "https://www.michelin.co.uk/auto/tyres/michelin-pilot-sport-4",
    // NOTE: Keep your change for michelin_brand_cover.jpg here, if that's the one you want
    img: `${process.env.PUBLIC_URL || ""}/assets/michelin-brand-cover.jpg`,
    desc: "Motion for Life.",
    brandId: "michelin",
    img_alt: "Michelin Pilot Sport 4 tyre photo"
  },
  {
    id: "continental_sport",
    brand: "Continental",
    model: "SportContact 6",
    type: "Performance",
    size: "225/40R18",
    price: 127,
    url: "https://www.continental-tires.com/uk/en/b2c/car/tires/contisportcontact-6.html",
    img: `${process.env.PUBLIC_URL || ""}/assets/20250605_071316_continental_pp_conti_cityplus.jpg`,
    desc: "The Future in Motion.",
    brandId: "continental",
    img_alt: "Continental SportContact 6 tyre photo"
  },
  {
    id: "bridgestone_turanza",
    brand: "Bridgestone",
    model: "Turanza T005",
    type: "Touring",
    size: "195/65R15",
    price: 103,
    url: "https://www.bridgestone.co.uk/our-products/car-tyres/turanza-t005",
    img: `${process.env.PUBLIC_URL || ""}/assets/20250605_071315_Bridgestone-Turanza-T005-1.jpg`,
    desc: "Solutions for your journey.",
    brandId: "bridgestone",
    img_alt: "Bridgestone Turanza T005 tyre photo"
  }
];

/**
 * Remove all neon styling, use only Porsche.com palette and minimalist structure.
 * Use a dual card/grid main layout with a looping video background hero,
 * prominent 'All tyres' option, and understated Porsche-inspired typography/colors.
 */

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

function MainTyreSenseRoutes() { // Removed 'props' as it's unused
  // Extract main app logic and state here (copied from above).
  const [stage, setStage] = useState("BLACKOUT");
  const [userCar, setUserCar] = useState(loadCarFromLS());
  const [reminderTyre, setReminderTyre] = useState(null);
  const [showReminderPopup, setShowReminderPopup] = useState(false);

  // --- Geolocation for map ---
  const [userLocation, setUserLocation] = useState(null);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // -- Tyre replacement popup logic: Show reminder (modal/popup) on "Remind Me",
  // and/or when tyres are due for replacement --
  // If 'lastTyreChange' is >6 years ago, show popup when app loads or car changes

  // Make reminder popup visible
  function handleSetReminderPopup(tyre) {
    setReminderTyre(tyre);
    setShowReminderPopup(true);
  }

  // Check for overdue tyres and auto-trigger popup on mount/car change
  useEffect(() => {
    if (userCar && userCar.lastTyreChange) {
      const lastChangeDate = new Date(userCar.lastTyreChange);
      const today = new Date();
      const diffYears = (today - lastChangeDate) / (1000 * 60 * 60 * 24 * 365.25);
      // Criteria: more than 6 years since tyre change triggers popup (overdue)
      if (diffYears >= 6 && !showReminderPopup) {
        // Note: Use any demo tyre as context; in real app, would track which
        setReminderTyre({
          brand: userCar.make ? "Your Vehicle Tyre" : "Tyre",
          model: userCar.model ? userCar.model : "Model",
        });
        setShowReminderPopup(true);
      }
    }
  }, [userCar]); // Re-run if userCar data changes


  const logoFadeInTimeout = useRef();
  useEffect(() => { setStage("CAR_ANIM"); }, []);
  const handleAnimatedCarDone = () => {
    setStage("LOGO_FADEIN");
    logoFadeInTimeout.current = setTimeout(() => {
      setStage("LIFT_BLACKOUT");
      setTimeout(() => setStage("SHOW_MAIN"), 540);
    }, 660);
  };
  useEffect(() => () => { if (logoFadeInTimeout.current) clearTimeout(logoFadeInTimeout.current); }, []);

  function closeReminderPopup() {
    setShowReminderPopup(false);
    setTimeout(() => setReminderTyre(null), 300);
  }

  // --- Blackout overlay states as before ---
  const showBlackout = stage !== "SHOW_MAIN";
  const blackoutStyle = showBlackout
    ? { opacity: stage === "LIFT_BLACKOUT" ? 0 : 1, transition: "opacity 540ms cubic-bezier(.71,0,.38,1)", pointerEvents: "all", zIndex: 2000 }
    : { opacity: 0, pointerEvents: "none" };
  const showAnimatedCar = stage === "CAR_ANIM" || stage === "LOGO_FADEIN" || stage === "LIFT_BLACKOUT";
  const showNavbarLogo = stage === "SHOW_MAIN";

  // For navigation
  const navigate = useNavigate();
  const location = useLocation();

  // Brand selection navigation
  const handleBrandSelect = (brand) => {
    // Go to /brand/<brand.id> page
    if (brand && brand.id) {
      navigate(`/brand/${brand.id}`);
    }
  };

  // If we are on the main page ("/")
  // const isMainPage = location.pathname === "/" || location.pathname === ""; // Removed as it's unused

  // Navbar/logo is shown for both main and brand pages
  // Main UI per Porsche visual guidelines
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
                fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
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
      {/* Blackout overlay */}
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
      {/* Animated car intro staged in center */}
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
                <div className="porsche-main-content">
                  <div style={{ maxWidth: 1320, margin: "0 auto", padding: "10px 8vw 28px 8vw" }}>
                    <h1
                      className="porsche-title tyresense-brand-gradient-text"
                      style={{
                        marginTop: 0,
                        background: "linear-gradient(90deg, #D41414 18%, #b4081b 82%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontWeight: 900,
                        textTransform: "uppercase"
                      }}
                    >
                      TyreSense
                    </h1>
                    <div
                      className="porsche-subtitle tyresense-brand-gradient-text"
                      style={{
                        fontWeight: 600,
                        fontSize: "1.14rem",
                        background: "linear-gradient(90deg, #D41414 6%, #b4081b 84%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        marginBottom: 12
                      }}
                    >
                      Premium tyres. Engineered for performance. Select your vehicle and explore leading brands.
                    </div>
                  </div>

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
                        onClick={() => {
                          // Accessible scroll-to-top on card click and in-app navigation
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          if (typeof handleBrandSelect === "function") {
                            handleBrandSelect({
                              id: tyre.brandId || (typeof tyre.brand === "string" ? tyre.brand.toLowerCase() : tyre.brand),
                              name: tyre.brand,
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" ||
                            e.key === " " ||
                            e.keyCode === 13 ||
                            e.keyCode === 32
                          ) {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            if (typeof handleBrandSelect === "function") {
                              handleBrandSelect({
                                id: tyre.brandId || (typeof tyre.brand === "string" ? tyre.brand.toLowerCase() : tyre.brand),
                                name: tyre.brand,
                              });
                            }
                          }
                        }}
                      >
                        <div className="porsche-tyre-card-img-wrapper">
                          <img
                            src={tyre.img || tyre.image || ""}
                            alt={`${tyre.brand} ${tyre.model} premium tyre${tyre.type ? ", " + tyre.type : ""}`} // FIX: Removed unnecessary escapes and math-inline
                            className="porsche-tyre-card-image"
                            loading="lazy"
                            draggable={false}
                            style={{
                              width: "98%",
                              height: "98%",
                              maxWidth: 246,
                              maxHeight: 186,
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
                          <span
                            className="porsche-accent-red"
                            style={{ fontWeight: 700, margin: "3px 0 4px 0" }}
                          >
                            {tyre.model}
                          </span>
                          <span
                            className="porsche-tyre-details"
                            style={{ margin: "0 0 2px 0", fontSize: "0.97rem" }}
                          >
                            {tyre.type ? <><b>{tyre.type}</b> · </> : null}
                            {tyre.size}
                            {tyre.price ? <> · £{tyre.price}</> : null}
                          </span>
                          {tyre.desc && (
                            <span
                              className="porsche-tyre-details"
                              style={{ color: "#a9aaae", fontSize: "0.96rem" }}
                            >
                              {tyre.desc}
                            </span>
                          )}
                          <button
                            className="porsche-tyre-card-btn"
                            aria-label={`Buy ${tyre.brand} ${tyre.model} now`}
                            tabIndex={0}
                            onClick={e => {
                              e.stopPropagation();
                              if (tyre.url) window.open(tyre.url, "_blank", "noopener,noreferrer");
                            }}
                            onKeyDown={e => {
                              if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
                                e.stopPropagation();
                                if (tyre.url) window.open(tyre.url, "_blank", "noopener,noreferrer");
                              }
                            }}
                          >
                            Buy Now
                          </button>
                        </div>
                      </article>
                    ))}
                  </section>
                  {/* --- END Porsche-style Porsche-dual-grid block --- */}

                  {/* Add TyreTypesShowcase here, or combine with the above grid as needed */}
                  {/* For example, if you want it after the main grid */}
                  <div style={{ margin: "58px 0 0 0" }} /> {/* Spacing */}
                  <TyreTypesShowcase onBrandSelect={handleBrandSelect} /> {/* FIX: Using TyreTypesShowcase */}
                  <div style={{ margin: "58px 0 0 0" }} /> {/* Spacing for visual balance */}


                  <section style={{ maxWidth: 930, margin: "0 auto", padding: "24px 0" }}>
                    <CarDetailsInput
                      onSubmit={car => { setUserCar(car); saveCarToLS(car); }}
                      initialCar={userCar}
                      persistCar={saveCarToLS}
                    />
                  </section>
                  {/* Map section */}
                  <section style={{ maxWidth: 900, margin: "0 auto", padding: "26px 13px 0 13px" }}>
                    <GoogleMapsStoreLocator />
                  </section>
                  {/* Porsche-style popover for reminder */}
                  <section style={{ maxWidth: 900, margin: "30px auto 0 auto", minHeight: 64 }}>
                    {showReminderPopup && reminderTyre ? (
                      <ReminderPopup
                        tyre={reminderTyre}
                        userEmail={userCar?.email || ""}
                        onClose={closeReminderPopup}
                      />
                    ) : (
                      <div style={{
                        minWidth: 260, minHeight: 43, background: "rgba(34,34,37,0.97)", color: "#fff",
                        borderRadius: 11, border: "1.2px solid #252526", padding: "17px 13px", textAlign: "center",
                        fontSize: "1.05rem", fontWeight: 500, boxShadow: "0 2px 9px #222", opacity: 0.87, marginTop: 8
                      }}>
                        <span>Tyre replacement reminder will appear here.</span>
                      </div>
                    )}
                    <TyreRecommendations
                      car={userCar}
                      userLocation={userLocation}
                      onSetReminder={handleSetReminderPopup}
                      userTyreData={null}
                      persistTyreData={() => {}}
                    />
                  </section>
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
                  // Go "home" rather than browser goBack to force rerender
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
    </div>
  );
}


/**
 * Wrapper for TyreBrandDetail that remounts on brand change (keyed by brandId)
 * This solves any React mount issues if <TyreBrandDetail /> was not updating on navigation
 */
function BrandDetailRoute({ onBackToList }) {
  // PUBLIC_INTERFACE
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