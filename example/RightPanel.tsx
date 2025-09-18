import React from 'react';
import { useRepoState, useRepoDispatch } from 'repostate';
import FeatureLoader from './FeatureLoader';
import DynamicFeatures from './DynamicFeatures';

const RightPanel: React.FC = () => {
  const [user] = useRepoState('user');
  const [books] = useRepoState<string[]>('books');
  const [featuresLoaded] = useRepoState<string[]>('app.featuresLoaded');
  const dispatch = useRepoDispatch();

  const borrowBook = (book: string) => {
    dispatch('user.borrowBooks', 'add', book);
  };

  const returnBook = (book: string) => {
    dispatch('user.borrowBooks', 'remove', book);
  };

  const updateUserInfo = (field: string, value: string) => {
    dispatch('user', 'update', { [field]: value });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            RepoState v2.0.0 Dynamic Demo
          </h1>
          <p className="text-gray-600">
            Explore dynamic state management with modular features that can be loaded at runtime.
          </p>
        </div>

        {/* Core Features Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Core Features (Always Loaded)
          </h2>

          {/* User Management */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">User Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => updateUserInfo('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={user.contact.email}
                  onChange={(e) => dispatch('user.contact', 'update', { ...user.contact, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                <strong>Borrowed Books:</strong> {user.borrowBooks.join(', ') || 'None'}
              </p>
            </div>
          </div>

          {/* Book Library */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Book Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {books.map((book: string) => (
                <div key={book} className="bg-white p-3 rounded border border-gray-200">
                  <p className="font-medium text-gray-800 mb-2">{book}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => borrowBook(book)}
                      disabled={user.borrowBooks.includes(book)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700"
                    >
                      {user.borrowBooks.includes(book) ? 'Borrowed' : 'Borrow'}
                    </button>
                    {user.borrowBooks.includes(book) && (
                      <button
                        onClick={() => returnBook(book)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Loader */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            🚀 Dynamic Feature Loading
          </h2>
          <p className="text-blue-700 mb-4">
            Load features dynamically using <code className="bg-blue-100 px-2 py-1 rounded">RepoState.add()</code>.
            Watch the state tree grow in real-time!
          </p>
          <FeatureLoader />
        </div>

        {/* Dynamic Features Display */}
        {featuresLoaded.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">
              ⚡ Loaded Features
            </h2>
            <p className="text-purple-700 mb-4">
              Interact with your dynamically loaded features:
            </p>
            <DynamicFeatures />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📖 How It Works
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>1. Modular State:</strong> Each feature adds its own state using <code>RepoState.add()</code>
            </p>
            <p>
              <strong>2. Conflict Prevention:</strong> Try loading the same feature twice to see automatic conflict detection
            </p>
            <p>
              <strong>3. Real-time Updates:</strong> Watch the left panel show your state tree growing dynamically
            </p>
            <p>
              <strong>4. Feature Interaction:</strong> Loaded features can interact and build upon each other
            </p>
            <p>
              <strong>5. Clean Architecture:</strong> Each feature contains its state and reducers together
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;