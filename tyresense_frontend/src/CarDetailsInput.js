import React, { useState, useEffect } from "react";
import "./CarDetailsInput.css";

// --- Updated car image data ---
const carImages = {
  Toyota: {
    Corolla: "https://cdn.motor1.com/images/mgl/NGg1Kn/s1/2025-toyota-gr-corolla.jpg",
    Camry: "https://cdn.motor1.com/images/mgl/BXyWGA/s1/2026-toyota-camry-dark-cosmos-paint.jpg",
    RAV4: "https://cdn.motor1.com/images/mgl/6Z4jPk/s1/2026-toyota-rav4-gr-sport-exterior-2.jpg",
    Highlander: "https://cdn.motor1.com/images/mgl/1ZEQQq/s4/2025-toyota-highlander-nightshade.webp",
    Supra: "https://cdn.motor1.com/images/mgl/BXynrm/s1/toyota-gr-supra.jpg",
  },
  Honda: {
    Civic: "https://cdn.motor1.com/images/mgl/G3noxb/s1/honda-civic.jpg",
    Accord: "https://cdn.motor1.com/images/mgl/XBYMke/s1/honda-accord.jpg",
    CRV: "https://cdn.motor1.com/images/mgl/RqYxGx/s1/honda-cr-v.jpg",
    Pilot: "https://cdn.motor1.com/images/mgl/MkOGyN/s1/2025-honda-pilot-black-edition.jpg",
    HRV: "https://cdn.motor1.com/images/mgl/NGjpPM/s1/2024-honda-hr-v.jpg",
  },
  Ford: {
    Escape: "https://cdn.motor1.com/images/mgl/W89KA6/s1/2023-ford-escape-st-line-elite.jpg",
    Mustang: "https://cdn.motor1.com/images/mgl/EKbZe/s1/ford-mustang-my-2022-stealth-edition.jpg",
    Explorer: "https://cdn.motor1.com/images/mgl/y24leo/s1/2025-ford-explorer-platinum.jpg",
    F150: "https://cdn.motor1.com/images/mgl/y2p2lo/s1/2024-ford-f-150-raptor.jpg",
    Bronco: "https://cdn.motor1.com/images/mgl/8AYVm2/s1/2025-ford-bronco.jpg",
  },
  BMW: {
    "3 Series": "https://www.topgear.com/sites/default/files/2022/09/1-BMW-3-Series.jpg",
    "5 Series": "https://mediapool.bmwgroup.com/cache/P9/201609/P90237243/P90237243-the-new-bmw-5-series-sedan-m-sport-10-2016-2249px.jpg",
    X5: "https://hips.hearstapps.com/hmg-prod/images/p90495464-1677001974.jpg?crop=0.720xw:0.608xh;0.250xw,0.329xh&resize=2048:*",
    M3: "https://cdn.motor1.com/images/mgl/y23QVm/s1/2025-bmw-m3-review.jpg",
    iX: "https://cdn.motor1.com/images/mgl/Kb8kAb/s1/bmw-ix-xdrive60-2025.jpg",
  },
  Mercedes: {
    "C-Class": "https://cdn.motor1.com/images/mgl/pXGyo/s1/mercedes-c-class-facelift-spy-photo.jpg",
    "E-Class": "https://cdn.motor1.com/images/mgl/38M9W/s1/2024-mercedes-benz-e-class.webp",
    GLC: "https://cdn.motor1.com/images/mgl/8mE4N/s1/2024-mercedes-benz-glc.webp",
    S550: "https://cdn.motor1.com/images/mgl/O8v2m/s1/2024-mercedes-benz-s-class.webp",
    EQS: "https://cdn.motor1.com/images/mgl/WByoY/s1/2023-mercedes-benz-eqs-sedan.webp",
  },
  Audi: {
    A4: "https://cdn.motor1.com/images/mgl/VOk9R/s1/2015-5940892016-audi-a41.jpg",
    A6: "https://cdn.motor1.com/images/mgl/1Z123w/s1/audi-a6-limousine-2025.jpg",
    Q5: "https://cdn.motor1.com/images/mgl/0AOqZ/s1/2024-audi-q5.webp",
    Q7: "https://cdn.motor1.com/images/mgl/gR3Wl/s1/2024-audi-q7.webp",
    eTron: "https://cdn.motor1.com/images/mgl/bxmYV/s1/2024-audi-q8-e-tron.webp",
  },
  Tesla: {
    "Model 3": "https://cdn.motor1.com/images/mgl/nPn4e/s1/2024-tesla-model-3.webp",
    "Model S": "https://cdn.motor1.com/images/mgl/XByM4/s1/2023-tesla-model-s.webp",
    "Model X": "https://cdn.motor1.com/images/mgl/m41V4/s1/2023-tesla-model-x.webp",
    "Model Y": "https://cdn.motor1.com/images/mgl/eE4o3/s1/2023-tesla-model-y.webp",
    Cybertruck: "https://cdn.motor1.com/images/mgl/O8vv3/s1/tesla-cybertruck.webp",
  },
  Hyundai: {
    Elantra: "https://cdn.motor1.com/images/mgl/1zmGv/s1/2024-hyundai-elantra.webp",
    Sonata: "https://cdn.motor1.com/images/mgl/gR3r0/s1/2024-hyundai-sonata.webp",
    Tucson: "https://cdn.motor1.com/images/mgl/E4nQk/s1/2024-hyundai-tucson.webp",
    Palisade: "https://cdn.motor1.com/images/mgl/WByQY/s1/2023-hyundai-palisade.webp",
    Kona: "https://cdn.motor1.com/images/mgl/V4xKq/s1/2024-hyundai-kona.webp",
  },
  Kia: {
    Forte: "https://cdn.motor1.com/images/mgl/R8rmj/s1/2024-kia-forte.webp",
    K5: "https://cdn.motor1.com/images/mgl/wR3mJ/s1/2024-kia-k5.webp",
    Sportage: "https://cdn.motor1.com/images/mgl/0ANR6/s1/2023-kia-sportage.webp",
    Telluride: "https://cdn.motor1.com/images/mgl/gR31V/s1/2023-kia-telluride.webp",
    EV6: "https://cdn.motor1.com/images/mgl/7Wv9R/s1/2023-kia-ev6.webp",
  },
  Nissan: {
    Sentra: "https://cdn.motor1.com/images/mgl/MjoWn/s1/2024-nissan-sentra.webp",
    Altima: "https://cdn.motor1.com/images/mgl/1zWJj/s1/2024-nissan-altima.webp",
    Rogue: "https://cdn.motor1.com/images/mgl/WByjE/s1/2023-nissan-rogue.webp",
    Pathfinder: "https://cdn.motor1.com/images/mgl/E4nkG/s1/2023-nissan-pathfinder.webp",
    GT_R: "https://cdn.motor1.com/images/mgl/qj4bM/s1/2024-nissan-gt-r.webp",
  },
  Volkswagen: {
    Jetta: "https://cdn.motor1.com/images/mgl/68Z4o/s1/2024-volkswagen-jetta.webp",
    Passat: "https://cdn.motor1.com/images/mgl/oE9mG/s1/2022-volkswagen-passat.webp",
    Tiguan: "https://cdn.motor1.com/images/mgl/4elE6/s1/2023-volkswagen-tiguan.webp",
    Atlas: "https://cdn.motor1.com/images/mgl/O8vO1/s1/2024-volkswagen-atlas.webp",
    ID4: "https://cdn.motor1.com/images/mgl/YxW40/s1/2024-volkswagen-id-4.webp",
  },
};

const carBrands = Object.keys(carImages);
const getModelsForBrand = (brand) => (brand ? Object.keys(carImages[brand] || {}) : []);

const fallbackCarSVG = (
  <svg
    aria-label="Default car silhouette"
    role="img"
    width="92"
    height="56"
    viewBox="0 0 92 56"
    xmlns="http://www.w3.org/2000/svg"
    style={{ maxWidth: "100%", height: "auto" }}
  >
    <g>
      <ellipse cx="23" cy="48" rx="10" ry="6" fill="#b4081b" />
      <ellipse cx="67" cy="48" rx="10" ry="6" fill="#b4081b" />
      <rect x="11" y="27" width="70" height="15" rx="7" fill="#232327" />
      <rect x="23" y="20" width="46" height="15" rx="7" fill="#292933" />
      <rect x="44" y="23" width="8" height="8" rx="3" fill="#b4081b" opacity={0.17} />
      <rect x="19" y="37" width="10" height="2" rx="1" fill="#7d7d85" />
      <rect x="63" y="37" width="10" height="2" rx="1" fill="#7d7d85" />
    </g>
  </svg>
);

// PUBLIC_INTERFACE
/**
 * CarDetailsInput: Upscale Porsche/Apple-inspired form for car details.
 * - Modern dark form box split in two (input fields left, car image preview right)
 * - All fields grouped cleanly, with bold neon-accented styling and error highlighting
 * - Responsive: vertical stack on small screens
 */
export default function CarDetailsInput({
  onSubmit,
  initialCar = {},
  persistCar,
  car = {},
}) {
  const safeCar =
    car && typeof car === "object" && !Array.isArray(car) ? car : {};
  const effectiveCar = Object.keys(initialCar || {}).length
    ? initialCar
    : safeCar;

  const [manufacturer, setManufacturer] = useState(effectiveCar.make || "");
  const [model, setModel] = useState(effectiveCar.model || "");
  const [year, setYear] = useState(effectiveCar.year || "");
  const [lastTyreChange, setLastTyreChange] = useState(
    effectiveCar.lastTyreChange ||
      (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 4);
        return d.toISOString().slice(0, 10);
      })()
  );
  const [carImg, setCarImg] = useState(effectiveCar.carImg || null);
  const [errors, setErrors] = useState({});
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Reset model and image when manufacturer changes
    setModel("");
    setCarImg(null);
    setErrors((e) => ({ ...e, manufacturer: null, model: null }));
  }, [manufacturer]);

  useEffect(() => {
    setErrors((e) => ({ ...e, year: null }));

    if (manufacturer && model && year) {
      const imgUrl = carImages[manufacturer]?.[model] || null;
      setCarImg(imgUrl);
    } else {
      setCarImg(null);
    }
  }, [manufacturer, model, year]);

  if (!car || typeof car !== "object" || Array.isArray(car)) return null;

  // Modern validation logic with custom feedback
  const validate = () => {
    const errs = {};
    if (!manufacturer) errs.manufacturer = "Please choose a manufacturer.";
    if (!model) errs.model = "Please select a model.";
    if (!year) errs.year = "Please select a year.";
    else if (year < 1980 || year > currentYear)
      errs.year = `Year must be between 1980 and ${currentYear}.`;

    if (!lastTyreChange) errs.lastTyreChange = "Enter last tyre change date.";
    else {
      const d = new Date(lastTyreChange);
      const maxDate = new Date();
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 20); // 20 years back from today
      if (d > maxDate || d < minDate)
        errs.lastTyreChange = `Date must be between ${minDate
          .toISOString()
          .slice(0, 10)} and ${maxDate.toISOString().slice(0, 10)}`;
    }
    setErrors(errs);
    return Object.keys(errs || {}).length === 0;
  };

  // PUBLIC_INTERFACE
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const carDetails = {
      make: manufacturer,
      model,
      year,
      lastTyreChange,
      carImg,
    };
    if (persistCar) persistCar(carDetails);
    if (onSubmit) onSubmit(carDetails);
  };

  // --- Porsche/Apple minimal instruction block ---
  const SubLabel = ({ children }) => (
    <span className="ts-label-sub">{children}</span>
  );
  const LabelInstruction = ({ children }) => (
    <span className="ts-label-instruction">{children}</span>
  );
  const ErrorNote = ({ error }) =>
    error ? (
      <span role="alert" className="ts-label-note" style={{ color: "#fb1744" }}>
        {error}
      </span>
    ) : null;

  // ----
  return (
    <form
      className="ts-car-input-form ts-premium"
      autoComplete="off"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Enter your car details"
      data-testid="car-details-form"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "3vw 2vw",
        alignItems: "stretch",
      }}
    >
      <div style={{ flex: "1 1 380px", minWidth: 220 }}>
        {/* Porsche minimal instruction/title */}
        <div className="ts-car-input-instruction" tabIndex={-1}>
          <span className="ts-car-input-instruction-title">
            Your Car Details
          </span>
          <span className="ts-car-input-instruction-desc">
            For personalized tyre recommendations and better results, please enter your car details accurately!
          </span>
        </div>
        <div
          className="ts-car-form-fields-container"
          style={{ display: "flex", flexWrap: "wrap", gap: "18px 0", alignItems: "flex-start" }}
        >
          {/* Manufacturer */}
          <fieldset className="ts-car-form-group" style={{ marginTop: 0, minWidth: 0 }}>
            <label htmlFor="manufacturer-select">
              Make / Manufacturer
              <SubLabel>required</SubLabel>
            </label>
            <select
              id="manufacturer-select"
              name="manufacturer"
              className={`ts-input${errors.manufacturer ? " ts-input-error" : ""}`}
              aria-describedby="manufacturer-error"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              required
              aria-invalid={!!errors.manufacturer}
            >
              <option value="">Choose brand (e.g., Toyota)</option>
              {carBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <ErrorNote error={errors.manufacturer} />
          </fieldset>
          {/* Model */}
          <fieldset className="ts-car-form-group">
            <label htmlFor="model-select">
              Model
              <SubLabel>required</SubLabel>
            </label>
            <select
              id="model-select"
              className={`ts-input${errors.model ? " ts-input-error" : ""}`}
              value={model}
              name="model"
              onChange={(e) => setModel(e.target.value)}
              required
              disabled={!manufacturer}
              aria-describedby="model-error"
              aria-invalid={!!errors.model}
            >
              <option value="">
                {manufacturer ? "Choose model" : "Select make first"}
              </option>
              {getModelsForBrand(manufacturer).map((modelName) => (
                <option key={modelName} value={modelName}>
                  {modelName}
                </option>
              ))}
            </select>
            <ErrorNote error={errors.model} />
          </fieldset>
          {/* Year */}
          <fieldset className="ts-car-form-group">
            <label htmlFor="year-select">
              Year
              <SubLabel>required</SubLabel>
            </label>
            <select
              id="year-select"
              className={`ts-input${errors.year ? " ts-input-error" : ""}`}
              value={year}
              name="year"
              required
              onChange={(e) => setYear(e.target.value)}
              aria-describedby="year-error"
              aria-invalid={!!errors.year}
            >
              <option value="">Select year</option>
              {Array.from({ length: currentYear - 1979 }, (_, i) =>
                currentYear - i
              ).map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <ErrorNote error={errors.year} />
          </fieldset>
          {/* Last Tyre Change */}
          <fieldset className="ts-car-form-group">
            <label htmlFor="last-tyre-change">
              Last Tyre Change <SubLabel>required</SubLabel>
            </label>
            <input
              id="last-tyre-change"
              name="lastTyreChange"
              className={`ts-input${errors.lastTyreChange ? " ts-input-error" : ""}`}
              type="date"
              min={new Date(new Date().setFullYear(new Date().getFullYear() - 20))
                .toISOString()
                .slice(0, 10)}
              max={new Date().toISOString().slice(0, 10)}
              aria-describedby="tyre-change-error tyre-change-hint"
              value={lastTyreChange}
              onChange={(e) => setLastTyreChange(e.target.value)}
              required
              aria-invalid={!!errors.lastTyreChange}
              placeholder="YYYY-MM-DD"
              style={{ fontSize: "1.07rem", fontWeight: 600 }}
            />
            <LabelInstruction>Date within last 20 years.</LabelInstruction>
            <ErrorNote error={errors.lastTyreChange} />
          </fieldset>
        </div>
        {/* Submit Button */}
        <div className="ts-car-form-submit modern-form-submit" style={{ marginTop: 36 }}>
          <button
            type="submit"
            className="btn"
            aria-label="Submit car details"
            style={{
              background: "linear-gradient(92deg, #b4081b 37%, #7d7d85 96%)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.13rem",
              letterSpacing: "0.045em",
              border: "none",
              borderRadius: 18,
              padding: "15px 48px",
              boxShadow: "0 4px 15px #b4081b50",
              outline: "none",
              minWidth: 128,
              minHeight: 48,
              cursor: "pointer",
              transition: "background 0.13s, color 0.14s"
            }}
          >
            Save Car Details
          </button>
        </div>
      </div>
      {/* Car Image Preview */}
      <div className="ts-car-img-preview">
        <div className="ts-car-img-preview-box modern-img-preview-box" tabIndex={-1}>
          {carImg ? (
            <img
              src={carImg}
              alt={`${manufacturer} ${model} ${year}`}
              style={{
                width: 133,
                height: 81,
                objectFit: "cover",
                borderRadius: 10,
                filter: "brightness(1.09)",
                background: "#19181b",
                userSelect: "none",
                pointerEvents: "none"
              }}
              draggable={false}
              onError={() => setCarImg(null)} // Fallback to SVG if image fails to load
            />
          ) : (
            fallbackCarSVG
          )}
        </div>
        <span className="ts-car-img-preview-label modern-preview-label">
          {carImg
            ? `${manufacturer} ${model} ${year}`.trim()
            : "Car preview"}
        </span>
      </div>
    </form>
  );
}