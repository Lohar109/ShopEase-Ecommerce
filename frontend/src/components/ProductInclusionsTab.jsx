import React from 'react';

const ProductInclusionsTab = ({ product }) => {
  const { hero_image_url, title, description } = product?.inclusions || {};

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-0">
        {/* Left Column (Text & Heading) - Takes 5 cols */}
        <div className="md:col-span-5 flex flex-col pt-0 mt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">{title || "What's Included"}</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            {description || ""}
          </p>
        </div>

        {/* Right Column (Media Container) - Takes 7 cols */}
        <div className="md:col-span-7 min-w-0 w-full h-[350px] bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden p-0" style={{ height: '366px', marginTop: '-16px' }}>
          {hero_image_url ? (
            <img 
              src={hero_image_url} 
              alt={title || "What's Included"} 
              className="w-full h-full object-cover block mx-auto"
            />
          ) : null}
        </div>
      </div>

      <div style={{ height: '1rem' }} aria-hidden="true" />

      {/* Sub-items Grid */}
      {product?.inclusions?.items && Array.isArray(product.inclusions.items) && product.inclusions.items.length > 0 && (
        <div className="pdp-inclusions-grid">
          {product.inclusions.items.map((item, idx) => (
            <div key={idx} className="pdp-inclusions-card">
              <div>
                <h3 className="pdp-inclusions-title">
                  {item.name || item.short_description || `Item ${idx + 1}`}
                </h3>

              </div>
              <div className="pdp-inclusions-img-box">
                <img src={item.image_url} alt={item.name || item.short_description || 'Item image'} className="pdp-inclusions-img" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProductInclusionsTab;
