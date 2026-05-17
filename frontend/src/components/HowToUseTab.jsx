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

      {/* Sub-items Horizontal Card Layout with Images */}
      {product?.how_to_use?.items && Array.isArray(product.how_to_use.items) && product.how_to_use.items.length > 0 && (
        <div className="mt-12 w-full">
          <style>{`
            .how-to-use-container {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 1.5rem;
              flex-wrap: nowrap;
              padding: 1rem 2rem;
              overflow-x: auto;
            }

            .how-to-use-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1.5rem;
              flex-shrink: 0;
              min-width: fit-content;
            }

            .how-to-use-circle {
              width: 150px;
              height: 150px;
              border-radius: 50%;
              border: 5px solid #D4A574;
              background-color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              flex-shrink: 0;
            }

            .how-to-use-circle img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }

            .how-to-use-circle-empty {
              width: 100%;
              height: 100%;
              background-color: #f3f4f6;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #9ca3af;
              font-size: 0.875rem;
            }

            .how-to-use-text {
              text-align: center;
              max-width: 140px;
            }

            .how-to-use-title {
              font-weight: 700;
              font-size: 1rem;
              color: #111827;
              line-height: 1.25;
              margin-bottom: 0.5rem;
            }

            .how-to-use-desc {
              font-size: 0.875rem;
              color: #4b5563;
              line-height: 1.5;
            }

            .how-to-use-arrow {
              display: none;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              color: #9ca3af;
              font-size: 1.75rem;
              margin: 0 0.5rem;
            }

            @media (min-width: 768px) {
              .how-to-use-arrow {
                display: flex;
              }
            }

            @media (max-width: 767px) {
              .how-to-use-container {
                padding: 1rem 1rem;
                gap: 1rem;
              }

              .how-to-use-circle {
                width: 120px;
                height: 120px;
                border: 4px solid #D4A574;
              }

              .how-to-use-text {
                max-width: 120px;
              }

              .how-to-use-title {
                font-size: 0.9rem;
              }

              .how-to-use-desc {
                font-size: 0.8rem;
              }
            }
          `}</style>

          <div className="how-to-use-container">
            {product.how_to_use.items.map((item, idx) => {
              const text = item.name || item.short_description || '';
              const parts = text.split(':');
              const stepTitle = parts[0]?.trim() || `Step ${idx + 1}`;
              const stepDesc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';

              return (
                <React.Fragment key={idx}>
                  {/* Card */}
                  <div className="how-to-use-card">
                    {/* Circular Image Container */}
                    <div className="how-to-use-circle">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={stepTitle}
                        />
                      ) : (
                        <div className="how-to-use-circle-empty">No image</div>
                      )}
                    </div>

                    {/* Title and Description */}
                    <div className="how-to-use-text">
                      <div className="how-to-use-title">{stepTitle}</div>
                      <div className="how-to-use-desc">{stepDesc}</div>
                    </div>
                  </div>

                  {/* Arrow Connector */}
                  {idx < product.how_to_use.items.length - 1 && (
                    <div className="how-to-use-arrow">→</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default HowToUseTab;
