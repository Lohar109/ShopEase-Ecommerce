import React from 'react';

const ProductInclusionsTab = ({ product }) => {
  const { hero_image_url, title, description } = product?.inclusions || {};

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Full-width Header: Title & Description */}
      <div className="max-w-3xl mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-none">
          {title || "What's Included"}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description || ""}
        </p>
      </div>

      {/* Centered Inclusions Hero Graphic */}
      {hero_image_url && (
        <div className="w-full max-w-2xl mx-auto pdp-inclusions-hero-box mb-12">
          <img
            src={hero_image_url}
            alt={title || "What's Included"}
            className="pdp-inclusions-hero-img"
          />
        </div>
      )}

      {/* Sub-items Grid */}
      {product?.inclusions?.items && Array.isArray(product.inclusions.items) && product.inclusions.items.length > 0 && (
        <div className="pdp-inclusions-grid" style={{ marginTop: '0.5rem' }}>
          {product.inclusions.items.map((item, idx) => (
            <div key={idx} className="pdp-inclusions-card">
              <div>
                <h3 className="pdp-inclusions-title">
                  {item.name || item.short_description || `Item ${idx + 1}`}
                </h3>
              </div>
              <div className="pdp-inclusions-img-box">
                <img 
                  src={item.image_url} 
                  alt={item.name || item.short_description || 'Item image'} 
                  className="pdp-inclusions-img" 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductInclusionsTab;
