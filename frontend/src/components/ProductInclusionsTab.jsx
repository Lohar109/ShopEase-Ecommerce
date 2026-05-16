import React from 'react';

const ProductInclusionsTab = ({ product }) => {
  const { hero_image_url, title, description } = product?.inclusions || {};

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
        {/* Left Column (Text & Heading) - Takes 7 cols */}
        <div className="md:col-span-7 flex flex-col pt-0 mt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">{title || "What's Included"}</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            {description || ""}
          </p>
        </div>

        {/* Right Column (Media Container) - Takes 5 cols */}
        <div className="md:col-span-5 h-[290px] overflow-hidden rounded-2xl">
          {hero_image_url ? (
            <img 
              src={hero_image_url} 
              alt="Product Inclusions" 
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : null}
        </div>
      </div>

      {/* Bottom Layout: Inclusions Items */}
      <div className="w-full">
        {product?.inclusions?.items && Array.isArray(product.inclusions.items) && product.inclusions.items.length > 0 ? (
          product.inclusions.items.map((item, index) => (
            <div key={index} className="border-b border-gray-100 py-4 flex text-sm">
              <div className="text-gray-500 font-normal w-1/3">
                {item.name || `Item ${index + 1}`}
              </div>
              <div className="text-gray-900 font-medium w-2/3">
                {item.quantity || item.description || '-'}
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
};

export default ProductInclusionsTab;
