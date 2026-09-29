import React from 'react';

export default function MemoryToggle() {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Memory Mode:</span>
      <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded">ON / OFF Switch</button>
    </div>
  );
}
