"use strict"
import React from'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import RepoState from '../src';

// Initial state structure
const initialState = {
  user: {
    name: 'John Doe',
    contact: {
      email: 'john@example.com',
      phone: '123-456-7890',
    },
    borrowBooks: [],
  },
  books: ['The Hobbit', '1984', 'The Great Gatsby'],
};

// Initialize state
RepoState.initState(initialState);

// Add reducers to handle "add" and "remove" actions for both books and borrowedBooks
RepoState.addReducer('user.borrowBooks', 'add', (state, book) => {
  return [...state, book]; // Add the book to the borrowBooks array
});

RepoState.addReducer('user.borrowBooks', 'remove', (state, book) => {
  return state.filter((b) => b !== book); // Remove the book from the borrowBooks array
});

RepoState.addReducer('books', 'add', (state, book) => {
  return [...state, book]; // Add the book back to the books array
});

RepoState.addReducer('books', 'remove', (state, book) => {
  return state.filter((b) => b !== book); // Remove the book from the books array
});

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
