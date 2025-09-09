"use strict"
import React from 'react';
import { useRepoState, useRepoDispatch } from '../src';
import RepoState from '../src';
import FeatureLoader from './FeatureLoader';
import DynamicFeatures from './DynamicFeatures';

const RightPanel = () => {
  const [userName, setUserName] = useRepoState('user.name');
  const [email, setEmail] = useRepoState('user.contact.email');
  const [phone, setPhone] = useRepoState('user.contact.phone');
  const [books] = useRepoState('books');
  const [borrowedBooks] = useRepoState('user.borrowBooks');
  const [featuresLoaded] = useRepoState('app.featuresLoaded');

  // Optional features - might not exist initially
  const [cart] = useRepoState('cart');
  const [notifications] = useRepoState('notifications');
  const [theme] = useRepoState('settings.theme');

  const dispatch = useRepoDispatch();

  const borrowBook = (book) => {
    dispatch('user.borrowBooks', 'add', book);
    dispatch('books', 'remove', book);
  };

  const returnBook = (book) => {
    dispatch('user.borrowBooks', 'remove', book);
    dispatch('books', 'add', book);
  };

  // Dynamic feature loading functions
  const loadShoppingCart = () => {
    if (featuresLoaded.includes('cart')) return;

    RepoState.add(
      {
        cart: {
          items: [],
          total: 0
        }
      },
      [
        { path: 'cart.items', type: 'add', reducer: (items, newItem) => [...items, newItem] },
        { path: 'cart.items', type: 'remove', reducer: (items, itemId) => items.filter(item => item.id !== itemId) },
        { path: 'cart.total', type: 'calculate', reducer: (_, items) => items.reduce((sum, item) => sum + (item.price || 0), 0) },
        { path: 'cart', type: 'clear', reducer: () => ({ items: [], total: 0 }) }
      ]
    );

    dispatch('app.featuresLoaded', 'add', 'cart');
  };

  const loadNotifications = () => {
    if (featuresLoaded.includes('notifications')) return;

    RepoState.add(
      {
        notifications: {
          unread: 0,
          messages: []
        }
      },
      [
        { path: 'notifications.unread', type: 'increment', reducer: (state) => state + 1 },
        { path: 'notifications.unread', type: 'clear', reducer: () => 0 },
        { path: 'notifications.messages', type: 'add', reducer: (messages, newMsg) => [...messages, { ...newMsg, id: Date.now() }] },
        { path: 'notifications.messages', type: 'remove', reducer: (messages, msgId) => messages.filter(msg => msg.id !== msgId) }
      ]
    );

    dispatch('app.featuresLoaded', 'add', 'notifications');
  };

  const loadSettings = () => {
    if (featuresLoaded.includes('settings')) return;

    RepoState.add(
      {
        settings: {
          theme: 'light',
          language: 'en'
        }
      },
      [
        { path: 'settings.theme', type: 'toggle', reducer: (theme) => theme === 'light' ? 'dark' : 'light' },
        { path: 'settings', type: 'update', reducer: (state, updates) => ({ ...state, ...updates }) }
      ]
    );

    dispatch('app.featuresLoaded', 'add', 'settings');
  };

  // Cart operations
  const addToCart = (book) => {
    if (!cart) return;
    const item = { id: Date.now(), name: book, price: Math.floor(Math.random() * 20) + 5 };
    dispatch('cart.items', 'add', item);
    dispatch('cart.total', 'calculate', cart.items.concat(item));
  };

  const removeFromCart = (itemId) => {
    if (!cart) return;
    const updatedItems = cart.items.filter(item => item.id !== itemId);
    dispatch('cart.items', 'remove', itemId);
    dispatch('cart.total', 'calculate', updatedItems);
  };

  // Notification operations
  const addNotification = (message) => {
    if (!notifications) return;
    dispatch('notifications.messages', 'add', { text: message, timestamp: new Date().toLocaleTimeString() });
    dispatch('notifications.unread', 'increment');
  };

  return (
    <div className="p-6 w-3/4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Dynamic RepoState Features Demo</h2>
        <p className="text-gray-600 mb-4">
          This example demonstrates how RepoState allows you to add state and features dynamically.
          Click the buttons below to load new features and watch the state tree grow!
        </p>
      </div>

      {/* Feature Loading Section */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4 text-blue-800">Dynamic Feature Loading</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded text-white font-medium ${
              featuresLoaded.includes('cart')
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={loadShoppingCart}
            disabled={featuresLoaded.includes('cart')}
          >
            {featuresLoaded.includes('cart') ? '✓ Cart Loaded' : 'Load Shopping Cart'}
          </button>
          <button
            className={`px-4 py-2 rounded text-white font-medium ${
              featuresLoaded.includes('notifications')
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
            onClick={loadNotifications}
            disabled={featuresLoaded.includes('notifications')}
          >
            {featuresLoaded.includes('notifications') ? '✓ Notifications Loaded' : 'Load Notifications'}
          </button>
          <button
            className={`px-4 py-2 rounded text-white font-medium ${
              featuresLoaded.includes('settings')
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
            onClick={loadSettings}
            disabled={featuresLoaded.includes('settings')}
          >
            {featuresLoaded.includes('settings') ? '✓ Settings Loaded' : 'Load Settings'}
          </button>
        </div>
        <div className="text-sm text-blue-700">
          <strong>Loaded Features:</strong> {featuresLoaded.length === 0 ? 'None' : featuresLoaded.join(', ')}
        </div>
      </div>

      {/* User Info Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4 text-gray-800">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
            <input
              className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={userName}
              onChange={(e) => setUserName(null, e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input
              className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(null, e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone:</label>
            <input
              className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={phone}
              onChange={(e) => setPhone(null, e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-green-800">Available Books</h3>
            <div className="space-y-2">
              {books.map((book, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                  <span className="font-medium">{book}</span>
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
                      onClick={() => borrowBook(book)}
                    >
                      Borrow
                    </button>
                    {cart && (
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium"
                        onClick={() => addToCart(book)}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-red-800">Borrowed Books</h3>
            <div className="space-y-2">
              {borrowedBooks.length === 0 ? (
                <p className="text-gray-500 italic">No books borrowed</p>
              ) : (
                borrowedBooks.map((book, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                    <span className="font-medium">{book}</span>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                      onClick={() => returnBook(book)}
                    >
                      Return
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Features Display */}
      {cart && (
        <div className="mb-8 p-4 bg-orange-50 rounded-lg">
          <h3 className="text-lg font-bold mb-4 text-orange-800">
            Shopping Cart
            <span className="ml-2 text-sm font-normal text-gray-600">
              (Dynamically loaded feature)
            </span>
          </h3>
          <div className="mb-2">
            <strong>Total: ${cart.total}</strong>
          </div>
          <div className="space-y-2">
            {cart.items.length === 0 ? (
              <p className="text-gray-500 italic">Cart is empty</p>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                  <span>{item.name} - ${item.price}</span>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {notifications && (
        <div className="mb-8 p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-bold mb-4 text-purple-800">
            Notifications
            <span className="ml-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
              {notifications.unread}
            </span>
            <span className="ml-2 text-sm font-normal text-gray-600">
              (Dynamically loaded feature)
            </span>
          </h3>
          <div className="mb-4">
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm mr-2"
              onClick={() => addNotification('New notification message!')}
            >
              Add Notification
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => dispatch('notifications.unread', 'clear')}
            >
              Clear Unread Count
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {notifications.messages.length === 0 ? (
              <p className="text-gray-500 italic">No notifications</p>
            ) : (
              notifications.messages.map((msg) => (
                <div key={msg.id} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                  <div>
                    <div className="font-medium">{msg.text}</div>
                    <div className="text-xs text-gray-500">{msg.timestamp}</div>
                  </div>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() => dispatch('notifications.messages', 'remove', msg.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {theme && (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Settings
            <span className="ml-2 text-sm font-normal text-gray-600">
              (Dynamically loaded feature)
            </span>
          </h3>
          <div className="flex items-center gap-4">
            <div>
              <span className="font-medium">Theme: </span>
              <span className={`px-2 py-1 rounded text-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                {theme}
              </span>
            </div>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => dispatch('settings.theme', 'toggle')}
            >
              Toggle Theme
            </button>
          </div>
        </div>
      )}

      {/* Advanced Feature Loader */}
      <div className="mb-8">
        <FeatureLoader />
      </div>

      {/* Display Dynamically Loaded Features */}
      <div className="mb-8">
        <DynamicFeatures />
      </div>
    </div>
  );
};

export default RightPanel;
