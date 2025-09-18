import React from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import RepoState from 'repostate';

// Initialize with core app state
RepoState.add({
  app: {
    loading: false,
    version: '2.0.0',
    featuresLoaded: []
  }
});

// Add core user state with its reducers
RepoState.add(
  {
    user: {
      name: 'John Doe',
      contact: {
        email: 'john@example.com',
        phone: '123-456-7890',
      },
      borrowBooks: [],
    }
  },
  [
    // Reducers for managing borrowed books
    { path: 'user.borrowBooks', type: 'add', reducer: (state: string[], book: string) => [...state, book] },
    { path: 'user.borrowBooks', type: 'remove', reducer: (state: string[], book: string) => state.filter((b) => b !== book) },
    // User profile update reducer
    { path: 'user', type: 'update', reducer: (state: any, updates: any) => ({ ...state, ...updates }) },
  ]
);

// Add books state as a separate module (could be loaded later)
RepoState.add(
  {
    books: ['The Hobbit', '1984', 'The Great Gatsby'],
  },
  [
    // Reducers for managing the books collection
    { path: 'books', type: 'add', reducer: (state: string[], book: string) => [...state, book] },
    { path: 'books', type: 'remove', reducer: (state: string[], book: string) => state.filter((b) => b !== book) },
  ]
);

// Add feature tracking reducer
RepoState.addReducer('app.featuresLoaded', 'add', (state: string[], feature: string) => [...state, feature]);

const App: React.FC = () => {
  return (
    <RepoState.Provider>
      <div className="flex h-screen bg-gray-50">
        <LeftPanel />
        <RightPanel />
      </div>
    </RepoState.Provider>
  );
};

export default App;