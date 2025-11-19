"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="sticky bottom-0 z-50 border-t border-slate-200 bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} Admin Panel. Бүх эрх хуулиар хамгаалагдсан.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            Тусламж
          </a>
          <a
            href="#"
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            Дэмжлэг
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

