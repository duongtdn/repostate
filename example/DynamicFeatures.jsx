"use strict"
import React, { useState } from 'react';
import { useRepoState, useRepoDispatch } from '../src';

const DynamicFeatures = () => {
  const [featuresLoaded] = useRepoState('app.featuresLoaded');
  const [counter] = useRepoState('counter');
  const [todos] = useRepoState('todos');
  const [newTodoText, setNewTodoText] = useState('');
  const dispatch = useRepoDispatch();

  // Get all custom features (ones that aren't in our predefined list)
  const predefinedFeatures = ['cart', 'notifications', 'settings', 'counter', 'todos'];
  const customFeatures = featuresLoaded.filter(feature => !predefinedFeatures.includes(feature));

  const getCustomFeatureState = (featureName) => {
    const [featureState] = useRepoState(featureName);
    return featureState;
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    dispatch('todos.items', 'add', newTodoText.trim());
    setNewTodoText('');
  };

  const getFilteredTodos = () => {
    if (!todos) return [];
    switch (todos.filter) {
      case 'active':
        return todos.items.filter(item => !item.completed);
      case 'completed':
        return todos.items.filter(item => item.completed);
      default:
        return todos.items;
    }
  };

  return (
    <div className="space-y-6">
      {/* Counter Feature */}
      {counter && (
        <div className="p-4 bg-indigo-50 rounded-lg">
          <h4 className="text-lg font-bold mb-3 text-indigo-800">
            Counter Feature
            <span className="ml-2 text-sm font-normal text-gray-600">
              (Dynamically loaded)
            </span>
          </h4>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-2xl font-bold text-indigo-900">
              Count: {counter.value}
            </div>
            <div className="flex gap-2">
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
                onClick={() => dispatch('counter.value', 'increment')}
              >
                +1
              </button>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
                onClick={() => dispatch('counter.value', 'decrement')}
              >
                -1
              </button>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
                onClick={() => dispatch('counter.value', 'add', 5)}
              >
                +5
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => dispatch('counter.value', 'reset')}
              >
                Reset
              </button>
            </div>
          </div>
          {counter.history.length > 0 && (
            <div>
              <div className="text-sm font-medium text-indigo-800 mb-2">History:</div>
              <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                {counter.history.slice(-5).map((entry, index) => (
                  <div key={index} className="text-indigo-700">
                    {entry.timestamp}: {entry.action} (Value: {entry.value})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Todo Feature */}
      {todos && (
        <div className="p-4 bg-pink-50 rounded-lg">
          <h4 className="text-lg font-bold mb-3 text-pink-800">
            Todo List Feature
            <span className="ml-2 text-sm font-normal text-gray-600">
              (Dynamically loaded)
            </span>
          </h4>

          {/* Add new todo */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a new todo..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <button
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
              onClick={addTodo}
            >
              Add
            </button>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-4">
            {['all', 'active', 'completed'].map(filter => (
              <button
                key={filter}
                className={`px-3 py-1 rounded text-sm capitalize ${
                  todos.filter === filter
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-pink-700 border border-pink-300 hover:bg-pink-100'
                }`}
                onClick={() => dispatch('todos.filter', 'set', filter)}
              >
                {filter}
              </button>
            ))}
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm ml-2"
              onClick={() => dispatch('todos.items', 'clearCompleted')}
            >
              Clear Completed
            </button>
          </div>

          {/* Todo list */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {getFilteredTodos().length === 0 ? (
              <p className="text-gray-500 italic">
                {todos.filter === 'all' ? 'No todos yet' : `No ${todos.filter} todos`}
              </p>
            ) : (
              getFilteredTodos().map(todo => (
                <div key={todo.id} className="flex items-center gap-3 p-2 bg-white rounded shadow-sm">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => dispatch('todos.items', 'toggle', todo.id)}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {todo.text}
                  </span>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() => dispatch('todos.items', 'remove', todo.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-pink-700">
            Total: {todos.items.length} |
            Active: {todos.items.filter(t => !t.completed).length} |
            Completed: {todos.items.filter(t => t.completed).length}
          </div>
        </div>
      )}

      {/* Custom Features */}
      {customFeatures.map(featureName => {
        const CustomFeatureDisplay = () => {
          const [featureState] = useRepoState(featureName);

          if (!featureState) return null;

          return (
            <div key={featureName} className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="text-lg font-bold mb-3 text-yellow-800">
                {featureName.charAt(0).toUpperCase() + featureName.slice(1)} Feature
                <span className="ml-2 text-sm font-normal text-gray-600">
                  (Custom dynamically loaded feature)
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-yellow-800 mb-2">Data:</div>
                  <div className="text-sm text-yellow-700 mb-3">{featureState.data}</div>

                  <div className="text-sm font-medium text-yellow-800 mb-2">Counter: {featureState.counter}</div>
                  <div className="flex gap-2 mb-3">
                    <button
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => dispatch(`${featureName}.counter`, 'increment')}
                    >
                      Increment
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      onClick={() => dispatch(featureName, 'reset')}
                    >
                      Reset All
                    </button>
                  </div>

                  <div className="text-sm font-medium text-yellow-800 mb-2">
                    Config - Enabled: {featureState.config.enabled ? 'Yes' : 'No'}
                  </div>
                  <button
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                    onClick={() => dispatch(`${featureName}.config`, 'toggle')}
                  >
                    Toggle Config
                  </button>
                </div>

                <div>
                  <div className="text-sm font-medium text-yellow-800 mb-2">Items ({featureState.items.length}):</div>
                  <div className="mb-2">
                    <button
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => dispatch(`${featureName}.items`, 'add', `Item ${featureState.items.length + 1}`)}
                    >
                      Add Item
                    </button>
                  </div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {featureState.items.map((item, index) => (
                      <div key={index} className="text-xs text-yellow-700 bg-white px-2 py-1 rounded">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-yellow-600">
                Created: {new Date(featureState.config.createdAt).toLocaleString()}
              </div>
            </div>
          );
        };

        return <CustomFeatureDisplay key={featureName} />;
      })}
    </div>
  );
};

export default DynamicFeatures;
