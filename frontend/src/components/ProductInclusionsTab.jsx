import React from 'react';

const ProductInclusionsTab = ({ product }) => {
  // Debug log to verify data flow
  console.log("Inclusions Data Check:", product?.inclusions);

  // Extremely safe extraction
  const inclusions = product?.inclusions || {};
  
  return (
    <div className="w-full p-6 border border-red-200 bg-red-50/20 rounded-xl mt-6">
      <h2 className="text-xl font-bold text-gray-900">{inclusions.title || "No Title Found"}</h2>
      <p className="text-sm text-gray-600 mt-2">{inclusions.description || "No Description Found"}</p>
    </div>
  );
};

export default ProductInclusionsTab;
