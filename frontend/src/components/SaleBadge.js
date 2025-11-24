import React from 'react';

const SaleBadge = ({ price, originalPrice }) => {
  // Only display if originalPrice exists and is greater than current price
  if (!originalPrice || originalPrice <= price) return null;

  const percentage = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <div className="absolute top-2 left-2 bg-[#007BFF] text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
      {percentage}% OFF
    </div>
  );
};

export default SaleBadge;
