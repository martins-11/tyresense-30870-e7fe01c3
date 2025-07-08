import React from "react";
import "./App.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import TyreSenseMain from "./TyreSenseMain";
import TyreBrandDetail from "./TyreBrandDetail";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";

/**
 * Routes configuration:
 * - "/" renders TyreSenseMain inside the dark/red main container.
 * - "/brand/:brandId" renders TyreBrandDetail OUTSIDE all global/themed containers,
 *    giving it a white, modern UI (as a sibling route rather than nested).
 */

// PUBLIC_INTERFACE
function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="app">
          <TyreSenseMain />
        </div>
      } />
      <Route path="/brand/:brandId" element={<BrandDetailRoute />} />
    </Routes>
  );
}

// Wrapper to correctly handle the brandId param and page transitions
function BrandDetailRoute() {
  const navigate = useNavigate();
  const { brandId } = useParams();
  const brand = brandId ? { id: brandId } : undefined;

  return (
    <TyreBrandDetail
      brand={brand}
      onBack={() => navigate("/")}
      key={brandId}
    />
  );
}

export default App;