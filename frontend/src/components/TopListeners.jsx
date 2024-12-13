import React from 'react';

export const TopListeners = ({ listeners }) => {
  return (
    <div className="space-y-2">
      {listeners.map((listener, index) => (
        <div 
          key={listener.id} 
          className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md"
        >
          <div className="flex items-center space-x-3">
            <span className="font-bold">{index + 1}.</span>
            <span>{listener.username}</span>
          </div>
          <span className="text-gray-500">{listener.listenCount} plays</span>
        </div>
      ))}
    </div>
  );
};