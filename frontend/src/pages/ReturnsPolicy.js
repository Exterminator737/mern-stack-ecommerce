import React from "react";
import { ShieldCheck, RefreshCcw, Truck } from "lucide-react";

const ReturnsPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Returns Policy
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Shop with confidence
              </h2>
              <p className="text-gray-600 mt-1">
                If you are not completely satisfied with your purchase, we’re
                here to help.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RefreshCcw className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                30-day returns
              </h3>
              <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
                <li>Return most items within 30 days of delivery.</li>
                <li>
                  Items must be unused and in original packaging where
                  applicable.
                </li>
                <li>Refunds are processed to your original payment method.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="h-6 w-6 text-purple-600 mt-1" />
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                How to return
              </h3>
              <ol className="mt-2 list-decimal list-inside text-gray-600 space-y-1">
                <li>Contact support with your order number.</li>
                <li>
                  We’ll provide return instructions and a label if applicable.
                </li>
                <li>Once received and inspected, we’ll issue your refund.</li>
              </ol>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Note: Certain goods (e.g., perishable, hygiene-critical, custom
            items) may not be eligible. This page is informational and may be
            updated.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicy;
