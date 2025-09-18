import React, { useState } from 'react';
import RepoState from 'repostate';
import { useRepoDispatch } from 'repostate';

const FeatureLoader: React.FC = () => {
  const [customFeatureName, setCustomFeatureName] = useState('');
  const [loadingFeature, setLoadingFeature] = useState('');
  const [lastError, setLastError] = useState('');
  const dispatch = useRepoDispatch();

  const predefinedFeatures = [
    {
      name: 'cart',
      title: 'Shopping Cart',
      description: 'Add/remove items with automatic total calculation',
      color: 'orange'
    },
    {
      name: 'notifications',
      title: 'Notifications',
      description: 'Message system with unread count tracking',
      color: 'purple'
    },
    {
      name: 'settings',
      title: 'Settings',
      description: 'Theme toggling and configuration management',
      color: 'gray'
    },
    {
      name: 'counter',
      title: 'Counter',
      description: 'Increment/decrement operations with history tracking',
      color: 'blue'
    },
    {
      name: 'todos',
      title: 'Todo List',
      description: 'Complete todo management with filtering',
      color: 'green'
    }
  ];

  const loadFeature = async (featureName: string) => {
    setLoadingFeature(featureName);
    setLastError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading delay

      switch (featureName) {
        case 'cart':
          RepoState.add(
            {
              cart: {
                items: [] as Array<{id: number, name: string, price: number, quantity: number}>,
                total: 0
              }
            },
            [
              {
                path: 'cart.items',
                type: 'add',
                reducer: (items: any[], newItem: any) => [...items, { ...newItem, id: Date.now() }]
              },
              {
                path: 'cart.items',
                type: 'remove',
                reducer: (items: any[], itemId: number) => items.filter(item => item.id !== itemId)
              },
              {
                path: 'cart.items',
                type: 'updateQuantity',
                reducer: (items: any[], {id, quantity}: {id: number, quantity: number}) =>
                  items.map(item => item.id === id ? { ...item, quantity } : item)
              },
              {
                path: 'cart.total',
                type: 'calculate',
                reducer: (_: any, items: any[]) => items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
              }
            ]
          );
          break;

        case 'notifications':
          RepoState.add(
            {
              notifications: {
                messages: [] as Array<{id: number, text: string, type: 'info' | 'success' | 'warning' | 'error', timestamp: string}>,
                unread: 0
              }
            },
            [
              {
                path: 'notifications.messages',
                type: 'add',
                reducer: (messages: any[], newMessage: any) =>
                  [...messages, { ...newMessage, id: Date.now(), timestamp: new Date().toLocaleTimeString() }]
              },
              {
                path: 'notifications.messages',
                type: 'clear',
                reducer: () => []
              },
              {
                path: 'notifications.unread',
                type: 'increment',
                reducer: (count: number) => count + 1
              },
              {
                path: 'notifications.unread',
                type: 'reset',
                reducer: () => 0
              }
            ]
          );
          break;

        case 'settings':
          RepoState.add(
            {
              settings: {
                theme: 'dark' as 'light' | 'dark',
                language: 'en',
                autoSave: true,
                notifications: true
              }
            },
            [
              {
                path: 'settings.theme',
                type: 'toggle',
                reducer: (theme: 'light' | 'dark') => theme === 'dark' ? 'light' : 'dark'
              },
              {
                path: 'settings',
                type: 'update',
                reducer: (settings: any, updates: any) => ({ ...settings, ...updates })
              }
            ]
          );
          break;

        case 'counter':
          RepoState.add(
            {
              counter: {
                value: 0,
                history: [] as Array<{action: string, value: number, timestamp: string}>
              }
            },
            [
              {
                path: 'counter.value',
                type: 'increment',
                reducer: (value: number, amount = 1) => value + amount
              },
              {
                path: 'counter.value',
                type: 'decrement',
                reducer: (value: number, amount = 1) => Math.max(0, value - amount)
              },
              {
                path: 'counter.value',
                type: 'reset',
                reducer: () => 0
              },
              {
                path: 'counter.history',
                type: 'add',
                reducer: (history: any[], entry: any) =>
                  [...history.slice(-9), { ...entry, timestamp: new Date().toLocaleTimeString() }]
              }
            ]
          );
          break;

        case 'todos':
          RepoState.add(
            {
              todos: {
                items: [] as Array<{id: number, text: string, completed: boolean, priority: 'low' | 'medium' | 'high'}>,
                filter: 'all' as 'all' | 'active' | 'completed'
              }
            },
            [
              {
                path: 'todos.items',
                type: 'add',
                reducer: (items: any[], newTodo: any) =>
                  [...items, { ...newTodo, id: Date.now(), completed: false }]
              },
              {
                path: 'todos.items',
                type: 'toggle',
                reducer: (items: any[], todoId: number) =>
                  items.map(item => item.id === todoId ? { ...item, completed: !item.completed } : item)
              },
              {
                path: 'todos.items',
                type: 'remove',
                reducer: (items: any[], todoId: number) => items.filter(item => item.id !== todoId)
              },
              {
                path: 'todos.filter',
                type: 'set',
                reducer: (_: any, filter: string) => filter
              }
            ]
          );
          break;

        default:
          // Custom feature
          RepoState.add(
            {
              [featureName]: {
                data: `Custom data for ${featureName}`,
                count: 0,
                enabled: true
              }
            },
            [
              {
                path: `${featureName}.count`,
                type: 'increment',
                reducer: (count: number) => count + 1
              },
              {
                path: `${featureName}`,
                type: 'update',
                reducer: (state: any, updates: any) => ({ ...state, ...updates })
              }
            ]
          );
      }

      // Track that this feature has been loaded
      dispatch('app.featuresLoaded', 'add', featureName);

    } catch (error: any) {
      setLastError(error.message);
    } finally {
      setLoadingFeature('');
    }
  };

  const loadCustomFeature = () => {
    if (customFeatureName.trim()) {
      loadFeature(customFeatureName.trim());
      setCustomFeatureName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Predefined Features */}
      <div>
        <h3 className="text-lg font-medium text-blue-800 mb-3">Predefined Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {predefinedFeatures.map((feature) => (
            <div key={feature.name} className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <span className={`w-3 h-3 bg-${feature.color}-500 rounded-full mr-2`}></span>
                  <h4 className="font-medium text-gray-800">{feature.title}</h4>
                </div>
                <button
                  onClick={() => loadFeature(feature.name)}
                  disabled={loadingFeature === feature.name}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loadingFeature === feature.name ? 'Loading...' : 'Load'}
                </button>
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Feature */}
      <div>
        <h3 className="text-lg font-medium text-blue-800 mb-3">Custom Feature</h3>
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={customFeatureName}
              onChange={(e) => setCustomFeatureName(e.target.value)}
              placeholder="Enter custom feature name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && loadCustomFeature()}
            />
            <button
              onClick={loadCustomFeature}
              disabled={!customFeatureName.trim() || loadingFeature === customFeatureName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Load Custom
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Create your own feature with custom state and reducers
          </p>
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-600 mr-2">⚠️</span>
            <div>
              <h4 className="font-medium text-red-800">Error Loading Feature</h4>
              <p className="text-sm text-red-700 mt-1">{lastError}</p>
              <p className="text-xs text-red-600 mt-2">
                This demonstrates RepoState's conflict detection system.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureLoader;