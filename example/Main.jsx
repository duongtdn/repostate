"use strict"
import React from'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import RepoState from '../src';

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
    { path: 'user.borrowBooks', type: 'add', reducer: (state, book) => [...state, book] },
    { path: 'user.borrowBooks', type: 'remove', reducer: (state, book) => state.filter((b) => b !== book) },
  ]
);

// Add books state as a separate module (could be loaded later)
RepoState.add(
  {
    books: ['The Hobbit', '1984', 'The Great Gatsby'],
  },
  [
    // Reducers for managing the books collection
    { path: 'books', type: 'add', reducer: (state, book) => [...state, book] },
    { path: 'books', type: 'remove', reducer: (state, book) => state.filter((b) => b !== book) },
  ]
);

const App = () => {
  return (
    <RepoState.Provider>
      <div className="flex h-screen">
        <LeftPanel />
        <RightPanel />
      </div>
    </RepoState.Provider>
  );
};

export default App;
