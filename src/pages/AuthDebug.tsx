import React from 'react';
import AuthDebugger from '@/components/AuthDebugger';

export default function AuthDebug() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug Console</h1>
        <AuthDebugger />
      </div>
    </div>
  );
}