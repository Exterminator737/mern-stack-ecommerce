import React from "react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;
  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex items-center gap-2">
        {items.map((item, idx) => (
          <li key={idx} className="inline-flex items-center gap-2">
            {idx > 0 && <span className="text-gray-300">/</span>}
            {item.to ? (
              <Link
                to={item.to}
                className="hover:text-gray-700 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
