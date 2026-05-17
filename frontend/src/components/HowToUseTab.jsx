import React from 'react';

const HowToUseTab = ({ product }) => {
  const { hero_image_url, title, description } = product?.how_to_use || {};

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-2">
        {/* Left Column (Text & Heading) - Takes 5 cols */}
        <div className="md:col-span-5 flex flex-col pt-0 mt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">{title || "How to Use"}</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            {description || ""}
          </p>
        </div>

        {/* Right Column (Media Container) - Takes 7 cols */}
        <div className="md:col-span-7 min-w-0 w-full bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden p-6" style={{ height: '366px', marginTop: '-16px' }}>
          {hero_image_url ? (
            <img 
              src={hero_image_url} 
              alt="How to Use" 
              className="w-full h-full max-w-full max-h-full object-contain block mx-auto"
              style={{ borderRadius: '0.5rem' }}
            />
          ) : null}
        </div>
      </div>

      {/* Sub-items Grid */}
      {product?.how_to_use?.items && Array.isArray(product.how_to_use.items) && product.how_to_use.items.length > 0 && (
        <div className="pdp-inclusions-grid">
          {product.how_to_use.items.map((item, idx) => (
            <div key={idx} className="pdp-inclusions-card">
              <div>
                <div className="pdp-inclusions-badge">
                  {idx + 1}
                </div>
                <h3 className="pdp-inclusions-title">
                  {item.name || item.short_description || `Step ${idx + 1}`}
                </h3>
              </div>
              <div className="pdp-inclusions-img-box">
                <img src={item.image_url} alt={item.name || item.short_description || 'Step image'} className="pdp-inclusions-img" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default HowToUseTab;
