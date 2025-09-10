"use strict"
import React, { useEffect, useState } from 'react';
import { useRepoState } from '../src';
import RepoState from '../src';

// External API simulation functions that use RepoState.dispatch
const simulateExternalAPI = () => {
  // Simulate WebSocket notifications
  const simulateWebSocketNotification = () => {
    setTimeout(() => {
      RepoState.dispatch('notifications.messages', 'add', {
        text: 'New message received via WebSocket!',
        timestamp: new Date().toLocaleTimeString(),
        type: 'websocket'
      });
      RepoState.dispatch('notifications.unread', 'increment');
    }, 2000);
  };

  // Simulate periodic data updates
  const simulateDataSync = () => {
    setInterval(() => {
      const randomBook = `Book-${Math.floor(Math.random() * 1000)}`;
      RepoState.dispatch('books', 'add', randomBook);

      // Also add a notification about the new book
      if (RepoState.getSnapshot().notifications) {
        RepoState.dispatch('notifications.messages', 'add', {
          text: `New book added to library: ${randomBook}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'system'
        });
        RepoState.dispatch('notifications.unread', 'increment');
      }
    }, 10000); // Every 10 seconds
  };

  // Simulate external cart updates (e.g., from another browser tab)
  const simulateExternalCartUpdate = () => {
    setTimeout(() => {
      if (RepoState.getSnapshot().cart) {
        const randomItem = {
          id: Date.now(),
          name: `External Item ${Math.floor(Math.random() * 100)}`,
          price: Math.floor(Math.random() * 50) + 10
        };

        RepoState.dispatch('cart.items', 'add', randomItem);
        const currentCart = RepoState.getSnapshot().cart;
        RepoState.dispatch('cart.total', 'calculate', [...currentCart.items, randomItem]);

        if (RepoState.getSnapshot().notifications) {
          RepoState.dispatch('notifications.messages', 'add', {
            text: `Item added to cart externally: ${randomItem.name}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'cart'
          });
          RepoState.dispatch('notifications.unread', 'increment');
        }
      }
    }, 5000);
  };

  return {
    simulateWebSocketNotification,
    simulateDataSync,
    simulateExternalCartUpdate
  };
};

const ExternalDispatchDemo = () => {
  const [notifications] = useRepoState('notifications');
  const [books] = useRepoState('books');
  const [cart] = useRepoState('cart');
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState(null);

  const { simulateWebSocketNotification, simulateDataSync, simulateExternalCartUpdate } = simulateExternalAPI();

  const startSimulation = () => {
    setIsSimulationActive(true);

    // Start periodic updates
    const interval = simulateDataSync();
    setSimulationInterval(interval);

    // Trigger immediate external updates if features are loaded
    if (notifications) {
      simulateWebSocketNotification();
    }
    if (cart) {
      simulateExternalCartUpdate();
    }
  };

  const stopSimulation = () => {
    setIsSimulationActive(false);
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  };

  // Trigger external user profile update
  const simulateExternalProfileUpdate = () => {
    const randomNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

    RepoState.dispatch('user', 'update', {
      name: randomName,
      lastUpdated: new Date().toISOString()
    });

    if (notifications) {
      RepoState.dispatch('notifications.messages', 'add', {
        text: `Profile updated externally to: ${randomName}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'profile'
      });
      RepoState.dispatch('notifications.unread', 'increment');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  return (
    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
      <h3 className="text-lg font-bold mb-4 text-indigo-800">
        🚀 External Dispatch API Demo
      </h3>

      <div className="mb-4 p-3 bg-white rounded border border-indigo-100">
        <h4 className="font-semibold text-indigo-700 mb-2">What is External Dispatch?</h4>
        <p className="text-sm text-gray-700 mb-2">
          The new <code className="bg-gray-100 px-1 rounded">RepoState.dispatch()</code> method allows
          you to update state from outside React components. This is perfect for:
        </p>
        <ul className="text-xs text-gray-600 space-y-1 ml-4">
          <li>• WebSocket message handlers</li>
          <li>• Timer/interval callbacks</li>
          <li>• External API responses</li>
          <li>• Browser events (storage, focus, etc.)</li>
          <li>• Third-party library integrations</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <button
            className={`w-full px-4 py-2 rounded font-medium transition-colors ${
              isSimulationActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
            onClick={isSimulationActive ? stopSimulation : startSimulation}
          >
            {isSimulationActive ? '⏹️ Stop Auto-Updates' : '▶️ Start Auto-Updates'}
          </button>

          <button
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium"
            onClick={simulateExternalProfileUpdate}
          >
            🔄 Update Profile Externally
          </button>
        </div>

        <div className="space-y-2">
          <button
            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium"
            onClick={() => {
              if (notifications) {
                simulateWebSocketNotification();
              } else {
                alert('Load notifications feature first!');
              }
            }}
          >
            📡 Simulate WebSocket
          </button>

          <button
            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium"
            onClick={() => {
              if (cart) {
                simulateExternalCartUpdate();
              } else {
                alert('Load cart feature first!');
              }
            }}
          >
            🛒 Add Cart Item Externally
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <strong>Books Count:</strong> {books?.length || 0}
            {isSimulationActive && (
              <div className="text-green-600">📈 Auto-adding books...</div>
            )}
          </div>
          <div>
            <strong>Cart Items:</strong> {cart?.items?.length || 0}
            <div className="text-gray-500">
              {cart ? 'Cart loaded' : 'Load cart to see external updates'}
            </div>
          </div>
          <div>
            <strong>Notifications:</strong> {notifications?.unread || 0} unread
            <div className="text-gray-500">
              {notifications ? 'Notifications loaded' : 'Load notifications to see external updates'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">💡 How it Works</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>
            <code className="bg-blue-100 px-1 rounded">RepoState.dispatch('path', 'action', value)</code>
          </div>
          <div>• Updates state using the same reducer logic as React components</div>
          <div>• Automatically triggers re-renders for all connected components</div>
          <div>• Perfect for external events that need to update your app state</div>
        </div>
      </div>
    </div>
  );
};

export default ExternalDispatchDemo;
