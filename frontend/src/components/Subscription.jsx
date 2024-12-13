import React from 'react';

export const Subscription = ({ children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
      {children}
    </div>
  );
};