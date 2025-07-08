import React from "react";
import LeafletStoreLocator from "./LeafletStoreLocator";

/**
 * PUBLIC_INTERFACE
 * GoogleMapsStoreLocator: Legacy alias, now renders LeafletStoreLocator.
 * This file is retained only for backward compatibility.
 */
export default function GoogleMapsStoreLocator(props) {
  // Pass all props directly to LeafletStoreLocator, including onStoresFound
  return <LeafletStoreLocator {...props} />;
}