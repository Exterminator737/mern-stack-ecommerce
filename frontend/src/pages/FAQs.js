import React from "react";

const FAQs = () => {
  const faqs = [
    {
      q: "How do I place an order?",
      a: "Browse products, add items to your cart, then proceed to checkout to securely complete your purchase.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept major cards and secure online payments. Payment options are shown at checkout.",
    },
    {
      q: "How long does delivery take?",
      a: "Most orders ship within 1-2 business days. Delivery time depends on your address and chosen courier option.",
    },
    {
      q: "Can I track my order?",
      a: "Yes. Visit Orders in your account for live updates. Guests can track via the link in the order email.",
    },
    {
      q: "What is your returns policy?",
      a: "You can initiate a return within the returns window if your item is unused and in original packaging. See the full Returns Policy for details.",
    },
    {
      q: "Do you offer bulk or business discounts?",
      a: "Yes. For large or recurring orders, contact support with your requirements for a custom quote.",
    },
    {
      q: "How do I get an invoice for my order?",
      a: "Invoices are available in your account under Orders once payment is confirmed.",
    },
    {
      q: "The item I want is out of stock. What can I do?",
      a: "Add it to your wishlist and enable notifications. We’ll email you when it’s back in stock.",
    },
    {
      q: "How do I contact support?",
      a: "Email support@wholesaleza.co.za or call +27 00 000 0000. We aim to respond within one business day.",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 mb-8">
          Answers to common questions about shopping at Wholesale ZA.
        </p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
          {faqs.map((item, idx) => (
            <details key={idx} className="group p-4">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-gray-900 font-medium">{item.q}</span>
                <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="mt-2 text-gray-600 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>

        <div className="mt-8 text-sm text-gray-600">
          Still need help? Visit our Returns Policy or contact support at
          <span className="mx-1 font-medium">support@wholesaleza.co.za</span>
          or call <span className="font-medium">+27 00 000 0000</span>.
        </div>
      </div>
    </div>
  );
};

export default FAQs;
