import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FaqsTab = ({ product }) => {
  const faqs = Array.isArray(product?.faqs) ? product.faqs : [];
  const faqsHeaderImage = product?.faqs_header_image || '';
  const [openIndex, setOpenIndex] = useState(null);

  if (faqs.length === 0) return null;

  const toggle = (idx) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">

        <div className="md:col-span-5 flex flex-col pt-0 mt-0 gap-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            Find quick answers to the most common questions.
          </p>
          {faqsHeaderImage && (
            <div className="w-full rounded-2xl overflow-hidden bg-gray-50" style={{ maxHeight: '280px' }}>
              <img
                src={faqsHeaderImage}
                alt="FAQs"
                className="w-full h-full block"
                style={{ objectFit: 'contain', maxHeight: '280px' }}
              />
            </div>
          )}
        </div>

        <div className="md:col-span-7 min-w-0 w-full">
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <button
                onClick={() => toggle(idx)}
                onMouseOver={(e) => e.currentTarget.style.background = 'none'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'none'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                onFocus={(e) => e.currentTarget.style.transform = 'none'}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 8px 16px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '12px',
                  outline: 'none',
                  boxShadow: 'none',
                  transform: 'none',
                }}
              >
                <span className="text-sm text-gray-900" style={{ fontWeight: 600, lineHeight: 1.5 }}>
                  {faq.question}
                </span>
                {openIndex === idx
                  ? <ChevronUp className="w-4 h-4" style={{ color: '#6b7280', flexShrink: 0 }} />
                  : <ChevronDown className="w-4 h-4" style={{ color: '#6b7280', flexShrink: 0 }} />
                }
              </button>
              {openIndex === idx && (
                <div style={{ paddingBottom: '16px' }}>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FaqsTab;
