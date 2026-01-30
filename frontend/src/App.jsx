import React, { useState, useEffect } from 'react';
import Overview from './components/Overview';
import Recommendations from './components/Recommendations';
import ManageData from './components/ManageData';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Retail Intelligence
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              Live Store Overview
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'recommendations'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              Shelf Optimization
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'manage'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              Manage Data
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'recommendations' && <Recommendations />}
        {activeTab === 'manage' && <ManageData />}
      </main>
    </div>
  );
}

export default App;
