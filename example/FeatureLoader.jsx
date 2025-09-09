"use strict"
import React, { useState } from 'react';
import { useRepoState, useRepoDispatch } from '../src';
import RepoState from '../src';

const FeatureLoader = () => {
  const [featuresLoaded] = useRepoState('app.featuresLoaded');
  const [customFeatureName, setCustomFeatureName] = useState('');
  const dispatch = useRepoDispatch();

  const loadCounterFeature = () => {
    if (featuresLoaded.includes('counter')) return;

    RepoState.add(
      {
        counter: {
          value: 0,
          history: []
        }
      },
      [
        { path: 'counter.value', type: 'increment', reducer: (state) => state + 1 },
        { path: 'counter.value', type: 'decrement', reducer: (state) => state - 1 },
        { path: 'counter.value', type: 'add', reducer: (state, amount) => state + amount },
        { path: 'counter.value', type: 'reset', reducer: () => 0 },
        { path: 'counter.history', type: 'log', reducer: (history, action) => [...history, { action, timestamp: new Date().toLocaleTimeString(), value: action.value }] }
      ]
    );

    dispatch('app.featuresLoaded', 'add', 'counter');
  };

  const loadTodoFeature = () => {
    if (featuresLoaded.includes('todos')) return;

    RepoState.add(
      {
        todos: {
          items: [],
          filter: 'all', // 'all', 'active', 'completed'
          nextId: 1
        }
      },
      [
        {
          path: 'todos.items',
          type: 'add',
          reducer: (items, text) => {
            const newTodo = {
              id: Date.now(),
              text,
              completed: false,
              createdAt: new Date().toISOString()
            };
            return [...items, newTodo];
          }
        },
        { path: 'todos.items', type: 'toggle', reducer: (items, id) => items.map(item => item.id === id ? { ...item, completed: !item.completed } : item) },
        { path: 'todos.items', type: 'remove', reducer: (items, id) => items.filter(item => item.id !== id) },
        { path: 'todos.items', type: 'clearCompleted', reducer: (items) => items.filter(item => !item.completed) },
        { path: 'todos.filter', type: 'set', reducer: (_, filter) => filter }
      ]
    );

    dispatch('app.featuresLoaded', 'add', 'todos');
  };

  const loadCustomFeature = () => {
    if (!customFeatureName.trim() || featuresLoaded.includes(customFeatureName)) return;

    const featureName = customFeatureName.trim();

    RepoState.add(
      {
        [featureName]: {
          data: `This is the ${featureName} feature`,
          counter: 0,
          items: [],
          config: {
            enabled: true,
            createdAt: new Date().toISOString()
          }
        }
      },
      [
        { path: `${featureName}.counter`, type: 'increment', reducer: (state) => state + 1 },
        { path: `${featureName}.items`, type: 'add', reducer: (items, item) => [...items, item] },
        { path: `${featureName}.config`, type: 'toggle', reducer: (config) => ({ ...config, enabled: !config.enabled }) },
        { path: `${featureName}`, type: 'reset', reducer: () => ({
          data: `This is the ${featureName} feature`,
          counter: 0,
          items: [],
          config: { enabled: true, createdAt: new Date().toISOString() }
        })}
      ]
    );

    dispatch('app.featuresLoaded', 'add', featureName);
    setCustomFeatureName('');
  };

  return (
    <div className="p-4 bg-yellow-50 rounded-lg">
      <h3 className="text-lg font-bold mb-4 text-yellow-800">Advanced Feature Loader</h3>
      <p className="text-sm text-yellow-700 mb-4">
        Demonstrate loading complete feature modules with their own state and reducers.
      </p>

      <div className="space-y-4">
        {/* Counter Feature */}
        <div className="flex items-center justify-between p-3 bg-white rounded shadow-sm">
          <div>
            <div className="font-medium">Counter Feature</div>
            <div className="text-sm text-gray-600">Adds a counter with increment/decrement operations</div>
          </div>
          <button
            className={`px-4 py-2 rounded text-white font-medium ${
              featuresLoaded.includes('counter')
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
            onClick={loadCounterFeature}
            disabled={featuresLoaded.includes('counter')}
          >
            {featuresLoaded.includes('counter') ? '✓ Loaded' : 'Load Counter'}
          </button>
        </div>

        {/* Todo Feature */}
        <div className="flex items-center justify-between p-3 bg-white rounded shadow-sm">
          <div>
            <div className="font-medium">Todo Feature</div>
            <div className="text-sm text-gray-600">Adds a complete todo list with filtering</div>
          </div>
          <button
            className={`px-4 py-2 rounded text-white font-medium ${
              featuresLoaded.includes('todos')
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600'
            }`}
            onClick={loadTodoFeature}
            disabled={featuresLoaded.includes('todos')}
          >
            {featuresLoaded.includes('todos') ? '✓ Loaded' : 'Load Todos'}
          </button>
        </div>

        {/* Custom Feature */}
        <div className="p-3 bg-white rounded shadow-sm">
          <div className="font-medium mb-2">Custom Feature</div>
          <div className="text-sm text-gray-600 mb-3">Create a custom feature with a name of your choice</div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter feature name..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={customFeatureName}
              onChange={(e) => setCustomFeatureName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadCustomFeature()}
            />
            <button
              className={`px-4 py-2 rounded text-white font-medium text-sm ${
                !customFeatureName.trim() || featuresLoaded.includes(customFeatureName.trim())
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
              onClick={loadCustomFeature}
              disabled={!customFeatureName.trim() || featuresLoaded.includes(customFeatureName.trim())}
            >
              Create Feature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureLoader;
