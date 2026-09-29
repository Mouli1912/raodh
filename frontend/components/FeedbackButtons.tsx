import React from 'react';

export default function FeedbackButtons() {
  return (
    <div className="flex space-x-2">
      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">Accept</button>
      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>
      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Worked</button>
      <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm">Failed</button>
    </div>
  );
}
