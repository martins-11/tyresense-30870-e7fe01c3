import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TyreBrandDetail.css";
import TyreLogoSVG from "./TyreLogoSVG";
// LeafletStoreLocator import for map rendering
import LeafletStoreLocator from "./LeafletStoreLocator";

/*
 * MODERNIZED BLACK/RED THEME: This brand detail page now uses a dark canvas, deep-black containers, and red accents—in sync with homepage.
 */

/**
 * PUBLIC_INTERFACE
 * TyreBrandDetail
 *
 * Displays featured flagship tyres for a selected brand.
 * Each tyre card includes product image, name, and a "Buy Now" button linking to official site.
 * Purely visual Porsche-inspired card grid.
 *
 * Props:
 * - brand: { id: string } (one of 'michelin', 'bridgestone', 'continental', 'goodyear', 'pirelli')
 * - onBack: function - callback for back navigation
 */

// Hardcoded tyre data by brand (URLs and product links)
const TYRE_BRAND_DATA = {
  michelin: {
    name: "Michelin",
    tyres: [
      {
        name: "Pilot Sport 4",
        image_url: `/assets/michelin_pilotsport4.webp`,
        product_url: "https://www.michelin.in/auto/tyres/michelin-pilot-sport-4",
      },
      {
        name: "Pilot Sport 5",
        image_url: `/assets/michelin_pilotsport5.jpg`,
        product_url: "https://www.michelin.in/auto/tyres/michelin-pilot-sport-5",
      },
      {
        name: "Primacy 4",
        image_url: `/assets/michelin_primacy4.webp`,
        product_url: "https://www.michelin.in/auto/tyres/michelin-primacy-4",
      },
      {
        name: "CrossClimate 2 SUV",
        image_url: `/assets/michelin_crossclimate2.jpg`,
        product_url: "https://africa.michelin.com/en/auto/tyres/michelin-crossclimate-2-suv",
      },
    ],
  },
  bridgestone: {
    name: "Bridgestone",
    tyres: [
      {
        name: "Weather Control A005",
        image_url: `/assets/bridgestone_weathercontrol.png`,
        product_url: "https://www.bridgestone.co.uk/car-tyres/all-season-tyres-weather-control/a005",
      },
      {
        name: "Turanza T005 RFT",
        image_url: `/assets/bridgestone_turanzat005.jpg`,
        product_url: "https://www.bridgestone.co.in/passenger-tyres/turanza-tyres/t005-rft-t005a",
      },
      {
        name: "Potenza Sport",
        image_url: `/assets/bridgestone_potenzasport.jpg`,
        product_url: "https://www.bridgestone.com.sg/en/tyre/potenza-sport",
      },
      {
        name: "Blizzak LM005",
        image_url: `/assets/bridgestone_blizzaklm005.jpeg`,
        product_url: "https://www.bridgestonetire.com/tire/blizzak-lm005/185-60R16/",
      },
    ],
  },
  continental: {
    name: "Continental",
    tyres: [
      {
        name: "WinterContact TS 870",
        image_url: `/assets/continental_wintercontact.png`,
        product_url: "https://www.continental-tires.com/products/b2c/car/tires/wintercontact-ts-870/",
      },
      {
        name: "PremiumContact 7",
        image_url: `/assets/continental_premiumcontact2.webp`,
        product_url: "https://www.continental-tires.com/products/b2c/car/tires/premiumcontact-7/",
      },
      {
        name: "AllSeasonContact 2",
        image_url: `/assets/continental_allseasoncontact.jpg`,
        product_url: "https://www.continental-tires.com/products/b2c/car/tires/allseasoncontact-2/",
      },
      {
        name: "SportContact 7",
        image_url: `/assets/continental_sportcontact7.webp`,
        product_url: "https://www.continental-tires.com/products/b2c/car/tires/sportcontact-7/",
      },
    ],
  },
  
  pirelli: {
    name: "Pirelli",
    tyres: [
      {
        name: "P Zero",
        image_url: `/assets/pirelli_pzero.png`,
        product_url: "https://www.pirelli.com/tyres/en-in/car/catalogue/product/p-zero",
      },
      {
        name: "Cinturato All Season SF-2",
        image_url: `/assets/pirelli_allseasonsf2.png`,
        product_url: "https://www.pirelli.com/tyres/en-ww/car/catalogue/product/cinturato-all-season-sf-2",
      },
      {
        name: "Winter Sottozero 3",
        image_url: `/assets/pirelli_sottozero.png`,
        product_url: "https://www.pirelli.com/tires/en-us/car/catalog/product/winter-sottozero-3",
      },
      {
        name: "Cinturato P7",
        image_url: `/assets/pirelli_cinturatop7.png`,
        product_url: "https://www.pirelli.com/tyres/en-ww/car/catalogue/product/cinturato-p7",
      },
    ],
  },
};

function getBrandData(brand) {
  // Fallback to Pirelli if brand.id is not provided or not found
  if (!brand || !brand.id || !TYRE_BRAND_DATA[brand.id]) return TYRE_BRAND_DATA["pirelli"];
  return TYRE_BRAND_DATA[brand.id];
}

const gridVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 + i * 0.09,
      duration: 0.27,
      type: "spring",
      stiffness: 62,
      damping: 18,
    },
  }),
  exit: { opacity: 0, y: 14, transition: { duration: 0.13 } },
};

function TyreBrandDetail({ brand, onBack }) {
  const { name, tyres } = getBrandData(brand);
  const [selected, setSelected] = useState(null);

  // Set black background on body for the brand detail page
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#18181c";
    return () => {
      document.body.style.background = prev || "";
    };
  }, []);

  // Card grid: homepage-style, black cards, modernized.
  return (
    <div
      className="ts-brand-detail-outer modern-black-brand-detail"
      style={{
        minHeight: "100vh",
        background: "#0c0c0e",
        fontFamily: "'Roboto', Helvetica, Arial, sans-serif"
      }}
      data-testid="brand-detail-view"
    >
      {/* Topbar Header */}
      <header
        className="ts-brand-detail-topbar"
        role="banner"
        aria-label="TyreSense navigation bar"
        style={{
          background: "rgba(18, 18, 19, 0.94)",
          borderBottom: "1.5px solid #18181c",
          minHeight: 62,
          boxShadow: "0 2px 11px #11111412"
        }}
      >
        <button
          className="ts-detail-back-btn"
          onClick={onBack}
          aria-label="Go back to brand selection"
          type="button"
          style={{
            marginLeft: 28,
            background: "none",
            border: "none",
            color: "#b4081b",
            fontSize: "1.13rem",
            fontWeight: 700,
            padding: "8px 24px 8px 5px",
            letterSpacing: ".15em",
            textDecoration: "underline",
            outline: "none",
            borderRadius: 0,
            cursor: "pointer",
            borderBottom: "2px solid transparent",
            transition: "color 0.17s, border 0.16s, background 0.14s"
          }}
          onMouseOver={e => (e.currentTarget.style.color = "#fff")}
          onFocus={e => (e.currentTarget.style.color = "#fff")}
          onMouseOut={e => (e.currentTarget.style.color = "#b4081b")}
        >
          ← Back
        </button>
        <div className="ts-animated-car-navbar" aria-hidden="true" style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -46%)",
          minWidth: 120,
          maxWidth: 320,
          height: 44,
          zIndex: 110,
          pointerEvents: "none",
        }}>
          <TyreLogoSVG className="ts-tyre-logo" style={{ marginRight: 7, width: 32, height: 32 }} />
          <span
            className="ts-animated-car-title"
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: "1.16rem",
              letterSpacing: "0.18em",
              fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
              textShadow: "0 0 13px #e1060078, 0 1px 14px #b4081bd3",
              background: "none",
              filter: "brightness(1.09) blur(0.01px)",
              verticalAlign: "middle"
            }}
          >
            TyreSense
          </span>
        </div>
      </header>

      {/* Black/Red Main Content */}
      <main
        className="ts-brand-detail-container"
        style={{
          margin: "0 auto",
          width: "100%",
          maxWidth: 1130,
          minHeight: "69vh",
          background: "#18181c",
          borderRadius: 35,
          boxShadow: "0 12px 40px 4px #1111141b, 0 2.5px 19px #b4081b12",
          padding: "5vw 0 2vw 0",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          zIndex: 2,
          position: "relative"
        }}
      >
        <nav aria-label="Breadcrumb">
          <p className="brand-detail-breadcrumb" style={{
            fontSize: "1.03rem",
            color: "#a9aaae",
            fontWeight: 500,
            marginLeft: "4vw",
            opacity: 0.93,
            marginBottom: 4,
            marginTop: 0,
            letterSpacing: "0.04em",
            fontFamily: "'Roboto', Helvetica, Arial, sans-serif"
          }}>
            <span style={{ fontWeight: 700, color: "#fff" }}>Explore Tyre Brands</span>
            <span style={{ color: "#b4081b", margin: "0 9px 0 9px" }}>/</span>
            <span style={{ color: "#b4081b", fontWeight: 700 }}>{name}</span>
          </p>
        </nav>
        <h1
          className="brand-detail-headline"
          style={{
            fontSize: "2.22rem",
            fontWeight: 900,
            letterSpacing: "0.045em",
            marginLeft: "4vw",
            marginBottom: "2.23em",
            marginTop: "0.3em",
            color: "#fff",
            fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
            textTransform: "uppercase",
            textShadow: "none",
            borderLeft: "5px solid #b4081b",
            paddingLeft: 16
          }}
        >
          {name} &mdash; Featured Tyres
        </h1>
        <section
          className="porsche-type-card-grid"
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: 1030,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2.8rem 2.35rem",
            alignItems: "stretch",
            justifyItems: "center",
            padding: "0 2vw 2.3vw 2vw"
          }}
          aria-label={`${name} tyre models`}
        >
          <AnimatePresence>
            {tyres.map((tyre, i) => (
              <motion.article
                key={tyre.name}
                className={`modern-porsche-type-card${selected === tyre.name ? " selected" : ""}`}
                tabIndex={0}
                role="region"
                aria-label={`${tyre.name} tyre card`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={gridVariants}
                custom={i}
                onClick={() => setSelected(tyre.name)}
                onKeyDown={(e) => {
                  if (["Enter", " "].includes(e.key)) {
                    e.preventDefault();
                    setSelected(tyre.name);
                  }
                }}
                style={{
                  background: "#232327",
                  borderRadius: 26,
                  boxShadow: "0 14px 33px #b4081b21, 0 2.5px 19px #18181c14",
                  border: selected === tyre.name ? "2.2px solid #b4081b" : "2px solid #2f2f33",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  minHeight: 320,
                  maxWidth: 340,
                  width: "100%",
                  position: "relative",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, border 0.15s, transform 0.15s",
                  outline: "none",
                  ...(selected === tyre.name
                    ? {
                        boxShadow:
                          "0 21px 82px 7px #b4081b17, 0 11px 32px 2px #2424290f"
                      }
                    : {})
                }}
              >
                <div
                  className="modern-porsche-type-card-img-row"
                  style={{
                    width: "100%",
                    height: 146,
                    background: "#19181b",
                    borderBottom: "1.4px solid #2f2f33",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={tyre.image_url}
                    alt={`${name} ${tyre.name} tyre`}
                    style={{
                      width: "85%",
                      height: "87%",
                      minHeight: 80,
                      objectFit: "cover",
                      borderRadius: 18,
                      filter: "brightness(1.1) contrast(1.14)",
                      boxShadow: "0 3px 14px #b4081b26",
                      margin: "0 auto",
                      display: "block",
                      userSelect: "none",
                      pointerEvents: "none",
                      background: "#0c0c0e"
                    }}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <div
                  className="modern-porsche-type-card-info-row"
                  style={{
                    padding: "24px 16px 18px 19px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    background: "none",
                    minHeight: 110
                  }}
                >
                  <h2
                    className="modern-porsche-type-model"
                    style={{
                      color: "#fff",
                      fontSize: "1.22rem",
                      fontWeight: 800,
                      letterSpacing: "0.097em",
                      marginBottom: "0.21em",
                      fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                      lineHeight: 1.13,
                      textShadow: "none"
                    }}
                  >
                    {tyre.name}
                  </h2>
                  {/* Optional description or highlights could go here */}
                  <a
                    href={tyre.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={0}
                    aria-label={`Buy ${name} ${tyre.name} on official site`}
                    onClick={e => e.stopPropagation()}
                    className="modern-porsche-type-select-btn"
                    style={{
                      marginTop: 13,
                      fontSize: "1.03rem",
                      borderRadius: 13,
                      background: "#b4081b",
                      color: "#fff",
                      border: "2px solid #b4081b",
                      fontWeight: 800,
                      letterSpacing: "0.21em",
                      padding: "11px 30px",
                      textTransform: "uppercase",
                      transition:
                        "border 0.18s, color 0.13s, background 0.13s, box-shadow 0.13s",
                      cursor: "pointer",
                      outline: "none",
                      alignSelf: "flex-start",
                      boxShadow: "0 5.5px 21px #b4081b23",
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.color = "#b4081b";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = "#b4081b";
                      e.currentTarget.style.color = "#fff";
                    }}
                  >
                    Buy Now
                  </a>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </section>
      </main>

      {/* Modern, minimal, bold brand detail with dark/red accent (MATCHES HOMEPAGE) */}
      {/* Insert LeafletStoreLocator (map) at the page bottom for flagship tyre store locations */}
      <section
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "38px auto 0 auto",
          padding: "0 18px 28px 18px",
          borderRadius: 22,
          boxShadow: "0 3px 15px #2f2f3322",
          background: "#141418",
          minHeight: 410,
          zIndex: 8,
          overflow: "hidden",
        }}
        aria-label="Nearby Tyre Stores Map"
      >
        <h2
          style={{
            color: "#b4081b",
            fontWeight: 600,
            letterSpacing: "0.08em",
            fontSize: "1.18rem",
            margin: "0 0 13px 0",
          }}
        >
          Find Tyre Stores Near You
        </h2>
        <div
          style={{
            borderRadius: 13,
            overflow: "hidden",
            border: "1.5px solid #2f2f33",
            boxShadow: "0 2px 14px #11111422",
            background: "#18181f",
            height: 400,
          }}
        >
          <LeafletStoreLocator />
        </div>
      </section>

    </div>
  );
}

export default TyreBrandDetail;