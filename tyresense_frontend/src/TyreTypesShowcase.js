import React from "react";
import "./TyreTypesShowcase.css";

/**
 * PUBLIC_INTERFACE
 * TyreTypesShowcase
 * Displays premium tyre brand cards styled in a Porsche-like vertical container.
 * * @param {function} onBrandSelect - Called when a brand is clicked, receives brand object.
 * @param {Array} brands - Optional list of tyre brands to show. Defaults to preset premium brands.
 */

const getPublicUrl = () =>
  (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL
    : window.PUBLIC_URL || "");

const DEFAULT_BRANDS = [
  {
    id: "pirelli",
    name: "Pirelli",
    tagline: "Performance meets Innovation",
    image: getPublicUrl() + "/assets/20250605_071317_Pirelli-Cintaurato-P7.jpg",
  },
  {
    id: "michelin",
    name: "Michelin",
    tagline: "Motion for Life",
    image: getPublicUrl() + "/assets/michelin_brand_cover.jpg",
  },
  {
    id: "continental",
    name: "Continental",
    tagline: "The Future in Motion",
    image: getPublicUrl() + "/assets/20250605_071316_continental_pp_conti_cityplus.jpg",
  },
  {
    id: "bridgestone",
    name: "Bridgestone",
    tagline: "Solutions for your journey",
    image: getPublicUrl() + "/assets/20250605_071315_Bridgestone-Turanza-T005-1.jpg",
  },
];

function TyreTypesShowcase({ onBrandSelect, brands = DEFAULT_BRANDS }) {
  return (
    <section className="ts-section ts-tyre-brands-showcase" aria-label="Tyre brands showcase">
      <header className="tyre-showcase-header">
        <h2>Explore Tyre Brands</h2>
        <p className="tyre-showcase-desc">Premium, trusted choices for every journey.</p>
      </header>
      <div className="tyre-brands-grid">
        {brands.map((brand) => (
          <button
            key={brand.id}
            className="tyre-brand-card premium-brand-container"
            aria-label={`View details for ${brand.name}`}
            onClick={() => onBrandSelect && onBrandSelect(brand)}
            type="button"
            tabIndex={0}
          >
            <div className="tyre-brand-cover-bg" aria-hidden="true">
              <img
                src={brand.image}
                alt={
                  brand.id === "pirelli"
                    ? "Pirelli Cinturato P7 tyre photo, full detail"
                    : brand.id === "michelin"
                    ? "Michelin Tyres, tread detail close-up"
                    : brand.id === "continental"
                    ? "Continental CityPlus tyre, macro sidewall/tread"
                    : brand.id === "bridgestone"
                    ? "Bridgestone Turanza T005 tyre, stacked detailed"
                    : `Photograph of a real ${brand.name} tyre`
                }
                loading="lazy"
                className="tyre-brand-img"
                draggable={false}
              />
              <div className="tyre-brand-img-overlay" />
            </div>
            <div className="tyre-brand-info-col premium-info-col">
              <div className="tyre-brand-logo">
                <span className="tyre-brand-name" aria-hidden="true">
                  {brand.name}
                </span>
              </div>
              {brand.tagline && (
                <span className="tyre-brand-tagline">{brand.tagline}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default TyreTypesShowcase;