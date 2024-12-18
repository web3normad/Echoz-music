// DashboardLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex dark:bg-[#131316] bg-[#fafafa]">
      <Sidebar />
      <div className="w-full dark:bg-[#131316] z-10">
        <Navbar />
        <main className="p-4 bg-gray-50 dark:bg-[#0F0F0F] overflow-y-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
