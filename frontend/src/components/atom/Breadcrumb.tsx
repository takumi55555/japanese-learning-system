import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm mb-3 sm:mb-4 md:mb-6" aria-label="Breadcrumb">
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <Home className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          {item.path && index < items.length - 1 ? (
            <button
              onClick={() => navigate(item.path!)}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};



