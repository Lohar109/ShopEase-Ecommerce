import React from 'react';

const ProductInclusionsTab = ({ product }) => {
  // Debug log to verify data flow
  console.log("Inclusions Data Check:", product?.inclusions);

  // Extremely safe extraction with fallback for legacy naming
  const inclusions = product?.inclusions || product?.whats_in_the_box || {};
  
  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
        {/* Left Column (Text & Heading) - Takes 7 cols */}
        <div className="md:col-span-7 flex flex-col pt-0 mt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">{inclusions.title || "What's Included"}</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            {inclusions.description || "No description available"}
          </p>
        </div>

        {/* Right Column (Media Container) - Takes 5 cols */}
        {inclusions.image && (
          <div className="md:col-span-5 h-[290px] overflow-hidden rounded-2xl">
            <img 
              src={inclusions.image} 
              alt="What's Included" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        )}
      </div>

      {/* Bottom Layout: Inclusions List */}
      <div className="w-full">
        {inclusions.items && Array.isArray(inclusions.items) && inclusions.items.length > 0 ? (
          inclusions.items.map((item, index) => (
            <div key={index} className="border-b border-gray-100 py-4 flex text-sm">
              <div className="text-gray-500 font-normal w-1/3">
                {item.name || `Item ${index + 1}`}
              </div>
              <div className="text-gray-900 font-medium w-2/3">
                {item.quantity || item.description || '-'}
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-sm text-gray-500">
            No inclusions information available
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInclusionsTab;
