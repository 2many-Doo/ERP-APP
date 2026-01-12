"use client";

import React from "react";
import { PropertyRateHistory } from "./PropertyRateHistory";
import { getNeedActionAnnualRates } from "@/lib/api";

// Pending-only view for updating/approving rates using need-action endpoint
const PropertyRateUpdate: React.FC = () => {
  return (
    <PropertyRateHistory
      title="Үнэлгээ засах"
      defaultYear={2026}
      forceStatus="pending"
      hideStatusFilter
      hideForceStatusLabel
      fetchRates={(_, year, page, perPage) => getNeedActionAnnualRates(year, page, perPage)}
    />
  );
};

export default PropertyRateUpdate;

