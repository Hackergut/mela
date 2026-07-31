import React, { useState, useEffect } from 'react';

export default function PromoBanner() {
  const text = "Get a 20% discount  USE CODE 20PD   •   ";
  const repeated = text.repeat(10);

  return (
    <div className="bg-[#1d1d1f] text-white overflow-hidden py-2.5">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-xs tracking-widest uppercase font-medium">
          {repeated}
        </span>
        <span className="text-xs tracking-widest uppercase font-medium" aria-hidden="true">
          {repeated}
        </span>
      </div>
    </div>
  );
}