import React from 'react';

export default function SingleIncidentPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Incident {params.id}</h1>
      <p className="text-gray-600">Single-screen incident view page.</p>
    </div>
  );
}
