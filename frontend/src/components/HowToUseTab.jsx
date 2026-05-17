import React from 'react';
import { Lightbulb } from 'lucide-react';

const HowToUseTab = ({ product }) => {
  const { hero_image_url, title, description, tip } = product?.how_to_use || {};

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-2">
        {/* Left Column (Text & Heading) - Takes 5 cols */}
        <div className="md:col-span-5 flex flex-col pt-0 mt-0 gap-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">{title || "How to Use"}</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            {description || ""}
          </p>

          {tip && (
            <div className="flex items-start gap-4">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 107, 107, 0.08)',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Lightbulb className="w-4 h-4" style={{ color: '#c21f58ff' }} />
              </div>
              <span className="text-sm text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Tip:</strong> {tip}
              </span>
            </div>
          )}
        </div>

        {/* Right Column (Media Container) - Takes 7 cols */}
        <div className="md:col-span-7 min-w-0 w-full bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden p-0" style={{ height: '366px', marginTop: '-16px' }}>
          {hero_image_url ? (
            <img
              src={hero_image_url}
              alt={title || "How to Use"}
              className="w-full h-full object-cover block mx-auto"
            />
          ) : null}
        </div>
      </div>

      {/* Sub-items Horizontal Card Layout */}
      {product?.how_to_use?.items && Array.isArray(product.how_to_use.items) && product.how_to_use.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full">
          {product.how_to_use.items.map((item, idx) => {
            const text = item.name || item.short_description || '';
            const parts = text.split(':');
            const stepTitle = parts[0]?.trim() || `Step ${idx + 1}`;
            const stepDesc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';

            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div
                  className="pdp-inclusions-badge flex items-center justify-center mb-4"
                  style={{
                    width: '80px',
                    height: '80px',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  {idx + 1}
                </div>
                <h4 className="font-bold text-gray-900 text-base leading-snug mb-3">{stepTitle}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{stepDesc}</p>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default HowToUseTab;
