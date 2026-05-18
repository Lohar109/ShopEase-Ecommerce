import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FaqsTab = ({ product }) => {
  const faqs = product?.faqs || [];
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
        {/* Left Column (Text & Heading) - Takes 5 cols */}
        <div className="md:col-span-5 flex flex-col pt-0 mt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            Find quick answers to the most common questions.
          </p>
        </div>

        {/* Right Column (Accordion List) - Takes 7 cols */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="border-b border-gray-100 pb-4 transition-all duration-300"
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between py-3 text-left font-semibold text-gray-900 hover:text-[#dc1f5e] transition-colors gap-4"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none', paddingLeft: 0, paddingRight: 0 }}
                >
                  <span className="text-base font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 text-gray-500">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#dc1f5e] transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 transition-transform duration-300" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                <div 
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    marginTop: isOpen ? '0.5rem' : '0px'
                  }}
                >
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FaqsTab;
