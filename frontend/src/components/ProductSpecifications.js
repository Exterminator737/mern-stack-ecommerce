import React from 'react';
import { ExternalLink, Check, X } from 'lucide-react';

const ProductSpecifications = ({ specifications }) => {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  const renderValue = (spec) => {
    switch (spec.type) {
      case 'boolean':
        return spec.value ? (
          <span className="inline-flex items-center text-green-700 font-medium">
            <Check className="w-4 h-4 mr-1" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center text-red-700 font-medium">
            <X className="w-4 h-4 mr-1" /> No
          </span>
        );
      
      case 'list':
        return (
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {String(spec.value).split('\n').map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      
      case 'link':
        return (
          <a 
            href={spec.value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
          >
            {spec.value} <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        );
      
      case 'number':
        return <span className="font-mono text-gray-800">{spec.value}</span>;

      case 'text':
      default:
        return <span className="text-gray-800">{spec.value}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Product Information</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {specifications.map((spec, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-500 bg-gray-50/30 w-1/3 align-top border-r border-gray-100">
                  {spec.label}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 align-top w-2/3">
                  {renderValue(spec)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductSpecifications;
