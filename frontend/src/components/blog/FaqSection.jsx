"use client";

 
import { useState } from "react";

export default function FaqSection({ faqs = [] }) {
  if (!faqs.length) return null;
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <dl className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
      {faqs.map((faq, i) => {
        const isOpen    = openIndex === i;
        const headingId = `faq-question-${i}`;
        const panelId   = `faq-answer-${i}`;

        return (
          <div key={i} className="bg-white">
            <dt>
              <button
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left
                           text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-inset
                           focus-visible:ring-blue-500"
              >
                <span>{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200
                              ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </dt>
            <dd
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
              className="px-6 pb-4 text-sm text-gray-600 leading-relaxed"
            >
              {faq.answer}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}